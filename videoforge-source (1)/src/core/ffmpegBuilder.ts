import { Project, Clip } from '../types/timeline';

export interface FFmpegExportConfig {
  resolution: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '9:16' | '1:1';
  fps: number;
  quality: 'high' | 'medium' | 'draft';
  outputFileName: string;
}

export interface FFmpegCommandResult {
  command: string;
  filterGraph: string;
  inputArgs: string[];
  outputArgs: string[];
  totalDurationSeconds: number;
  warnings: string[];
}

export function getResolutionDimensions(
  resolution: '720p' | '1080p' | '4k',
  aspectRatio: '16:9' | '9:16' | '1:1'
): { width: number; height: number } {
  if (aspectRatio === '9:16') {
    switch (resolution) {
      case '720p':
        return { width: 720, height: 1280 };
      case '4k':
        return { width: 2160, height: 3840 };
      case '1080p':
      default:
        return { width: 1080, height: 1920 };
    }
  } else if (aspectRatio === '1:1') {
    switch (resolution) {
      case '720p':
        return { width: 720, height: 720 };
      case '4k':
        return { width: 2160, height: 2160 };
      case '1080p':
      default:
        return { width: 1080, height: 1080 };
    }
  } else {
    // 16:9
    switch (resolution) {
      case '720p':
        return { width: 1280, height: 720 };
      case '4k':
        return { width: 3840, height: 2160 };
      case '1080p':
      default:
        return { width: 1920, height: 1080 };
    }
  }
}

export function buildFFmpegCommand(project: Project, config: FFmpegExportConfig): FFmpegCommandResult {
  const { width, height } = getResolutionDimensions(config.resolution, config.aspectRatio);
  const fps = config.fps || 30;
  const warnings: string[] = [];

  // Duration in seconds (ignoring effect clips)
  const mediaClips = project.clips.filter(c => c.trackIndex !== 5);
  const maxEndMs = mediaClips.length > 0 ? Math.max(...mediaClips.map(c => c.endMs)) : 10000;
  const totalDurationSeconds = maxEndMs / 1000;

  // Filter video clips on track 3 (Main Video)
  const videoClips = project.clips
    .filter(c => c.trackIndex === 3)
    .sort((a, b) => a.startMs - b.startMs);

  // Audio clips from Voice (0), Music (1), Sfx (2)
  const audioClips = project.clips
    .filter(c => [0, 1, 2].includes(c.trackIndex) && !c.hidden)
    .sort((a, b) => a.startMs - b.startMs);

  // Effect clips from Track 5
  const effectClips = project.clips.filter(c => c.trackIndex === 5 && !c.hidden);

  // Text clips from Track 6
  const textClips = project.clips.filter(c => c.trackIndex === 6 && !c.hidden);

  // Input mapping
  const inputArgs: string[] = [];
  const fileToInputIndex = new Map<string, number>();

  function registerInput(filePath: string): number {
    if (fileToInputIndex.has(filePath)) {
      return fileToInputIndex.get(filePath)!;
    }
    const idx = inputArgs.length;
    inputArgs.push(`-i "${filePath}"`);
    fileToInputIndex.set(filePath, idx);
    return idx;
  }

  // If no video clips exist, create a color background source
  const filters: string[] = [];
  let currentVideoOut = 'v_base';

  filters.push(`color=c=black:s=${width}x${height}:r=${fps}:d=${totalDurationSeconds.toFixed(3)} [v_base]`);

  // Process video clips
  if (videoClips.length > 0) {
    videoClips.forEach((clip, index) => {
      const srcFile = clip.sourceFilePath || `source_clip_${index}.mp4`;
      const inputIdx = registerInput(srcFile);
      const clipDurationSec = (clip.endMs - clip.startMs) / 1000;
      const srcInSec = clip.sourceInMs / 1000;

      const vNode = `v_clip_${index}`;
      const speedPts = (1 / (clip.speed || 1.0)).toFixed(4);

      // Transform & look filters
      const eqBright = (clip.look?.brightness || 0).toFixed(2);
      const eqContrast = (clip.look?.contrast || 1).toFixed(2);
      const eqSat = (clip.look?.saturation || 1).toFixed(2);

      let videoFilter = `[${inputIdx}:v] trim=start=${srcInSec}:duration=${clipDurationSec.toFixed(3)},setpts=PTS-STARTPTS,setpts=${speedPts}*PTS,scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,eq=brightness=${eqBright}:contrast=${eqContrast}:saturation=${eqSat} [${vNode}]`;
      filters.push(videoFilter);

      // Overlay onto base video at clip startMs
      const startSec = (clip.startMs / 1000).toFixed(3);
      const endSec = (clip.endMs / 1000).toFixed(3);
      const nextOut = `v_stage_${index}`;

      filters.push(
        `[${currentVideoOut}][${vNode}] overlay=0:0:enable='between(t,${startSec},${endSec})' [${nextOut}]`
      );
      currentVideoOut = nextOut;
    });
  }

  // Process Effect Layers (Track 5) with enable='between(t,s,e)'
  effectClips.forEach((eff, i) => {
    const startSec = (eff.startMs / 1000).toFixed(3);
    const endSec = (eff.endMs / 1000).toFixed(3);
    const nextOut = `v_eff_${i}`;

    let effectFilter = '';
    const effId = eff.effectId || 'vignette';

    switch (effId) {
      case 'sepia':
        effectFilter = `colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131:0`;
        break;
      case 'film_grain':
        effectFilter = `noise=alls=20:allf=t+u`;
        break;
      case 'black_white':
        effectFilter = `hue=s=0`;
        break;
      case 'vignette':
        effectFilter = `vignette=PI/4`;
        break;
      case 'rgb_split':
        effectFilter = `rgbashift=rh=-8:bh=8`;
        break;
      case 'glow':
        effectFilter = `gblur=sigma=10:steps=1,eq=contrast=1.3:brightness=0.05`;
        break;
      default:
        effectFilter = `vignette=PI/6`;
    }

    filters.push(
      `[${currentVideoOut}] split [eff_src_${i}][eff_passthru_${i}]; ` +
      `[eff_src_${i}] ${effectFilter} [eff_filtered_${i}]; ` +
      `[eff_passthru_${i}][eff_filtered_${i}] overlay=enable='between(t,${startSec},${endSec})' [${nextOut}]`
    );
    currentVideoOut = nextOut;
  });

  // Process Text Layers (Track 6) via drawtext
  textClips.forEach((txt, i) => {
    if (!txt.text?.text) return;
    const startSec = (txt.startMs / 1000).toFixed(3);
    const endSec = (txt.endMs / 1000).toFixed(3);
    const nextOut = `v_txt_${i}`;

    const cleanText = txt.text.text.replace(/'/g, "\\'").replace(/:/g, '\\:');
    const fontSize = Math.round(height * (txt.text.size || 0.055));
    const fontColor = txt.text.color || 'white';
    const isBold = txt.text.bold ? ':bold=1' : '';
    const boxParam = txt.text.box ? ':box=1:boxcolor=black@0.65:boxborderw=10' : '';

    // Position (default lower third ~ 75% height)
    const yExpr = `(h*0.75)`;
    const xExpr = `(w-text_w)/2`;

    // Animation expression support
    let alphaExpr = `1`;
    if (txt.text.animIn === 'fade') {
      const animSec = (txt.text.animMs || 500) / 1000;
      alphaExpr = `if(lt(t,${startSec}+${animSec}), (t-${startSec})/${animSec}, 1)`;
    }

    filters.push(
      `[${currentVideoOut}] drawtext=text='${cleanText}':fontsize=${fontSize}:fontcolor=${fontColor}${isBold}${boxParam}:x=${xExpr}:y=${yExpr}:alpha='${alphaExpr}':enable='between(t,${startSec},${endSec})' [${nextOut}]`
    );
    currentVideoOut = nextOut;
  });

  // Audio mix processing
  const audioNodes: string[] = [];
  audioClips.forEach((ac, i) => {
    const srcFile = ac.sourceFilePath || `audio_track_${ac.trackIndex}_${i}.wav`;
    const inputIdx = registerInput(srcFile);
    const clipDurSec = (ac.endMs - ac.startMs) / 1000;
    const delayMs = Math.round(ac.startMs);
    const vol = (ac.volume || 1.0).toFixed(2);
    const atempo = (ac.speed || 1.0).toFixed(2);
    const aNode = `a_clip_${i}`;

    filters.push(
      `[${inputIdx}:a] atempo=${atempo},volume=${vol},atrim=duration=${clipDurSec.toFixed(3)},adelay=${delayMs}|${delayMs} [${aNode}]`
    );
    audioNodes.push(`[${aNode}]`);
  });

  let audioMixClause = '';
  if (audioNodes.length > 0) {
    audioMixClause = `${audioNodes.join('')} amix=inputs=${audioNodes.length}:dropout_transition=0:duration=longest [a_out]`;
    filters.push(audioMixClause);
  } else {
    filters.push(`anullsrc=r=48000:cl=stereo:d=${totalDurationSeconds.toFixed(3)} [a_out]`);
  }

  // Quality settings
  let crf = '23';
  let preset = 'medium';
  if (config.quality === 'high') {
    crf = '18';
    preset = 'slow';
  } else if (config.quality === 'draft') {
    crf = '28';
    preset = 'veryfast';
  }

  const filterGraphString = filters.join(';\n');

  const outputArgs: string[] = [
    `-map "[${currentVideoOut}]"`,
    `-map "[a_out]"`,
    `-c:v libx264`,
    `-preset ${preset}`,
    `-crf ${crf}`,
    `-pix_fmt yuv420p`,
    `-c:a aac`,
    `-b:a 192k`,
    `-t ${totalDurationSeconds.toFixed(3)}`,
    `-y "${config.outputFileName || 'export.mp4'}"`,
  ];

  const fullCommand = [
    'ffmpeg',
    ...inputArgs,
    `-filter_complex "${filterGraphString.replace(/\n/g, ' ')}"`,
    ...outputArgs,
  ].join(' ');

  return {
    command: fullCommand,
    filterGraph: filterGraphString,
    inputArgs,
    outputArgs,
    totalDurationSeconds,
    warnings,
  };
}
