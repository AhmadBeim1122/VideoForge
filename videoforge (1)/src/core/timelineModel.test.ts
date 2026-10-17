import {
  addClip,
  moveClip,
  trimClip,
  splitClipAtPlayhead,
  deleteClip,
  duplicateClip,
  rippleDeleteClip,
  closeGapsOnTrack,
  changeClipSpeed,
  TimelineUndoRedoStack,
  isClipTypeAllowedOnTrack,
} from './timelineModel';
import { Project, TRACK_CONFIGS } from '../types/timeline';
import { buildFFmpegCommand } from './ffmpegBuilder';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function runTimelineUnitTests(): { total: number; passed: number; results: TestResult[] } {
  const results: TestResult[] = [];

  function assert(condition: boolean, testName: string, failureMsg?: string) {
    if (condition) {
      results.push({ name: testName, passed: true });
    } else {
      results.push({ name: testName, passed: false, message: failureMsg || 'Assertion failed' });
    }
  }

  const baseProject: Project = {
    id: 'test_proj',
    name: 'Unit Test Project',
    aspectRatio: '16:9',
    resolution: '1080p',
    fps: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    durationMs: 10000,
    layoutVersion: 4,
    tracks: TRACK_CONFIGS,
    clips: [],
  };

  // Test 1: Track Accept Rules
  assert(isClipTypeAllowedOnTrack('audio', 0), 'Track 0 accepts Voice audio');
  assert(isClipTypeAllowedOnTrack('audio', 1), 'Track 1 accepts Music audio');
  assert(isClipTypeAllowedOnTrack('audio', 2), 'Track 2 accepts Sfx audio');
  assert(isClipTypeAllowedOnTrack('video', 3), 'Track 3 accepts Video');
  assert(isClipTypeAllowedOnTrack('image', 3), 'Track 3 accepts Image');
  assert(!isClipTypeAllowedOnTrack('text', 3), 'Track 3 rejects Text');
  assert(isClipTypeAllowedOnTrack('effect', 5), 'Track 5 accepts Effect');
  assert(!isClipTypeAllowedOnTrack('video', 5), 'Track 5 rejects Video');
  assert(isClipTypeAllowedOnTrack('text', 6), 'Track 6 accepts Text');

  // Test 2: Add Clip with track validation
  const testVideoClip = {
    id: 'c_vid_1',
    name: 'Main Video',
    type: 'video' as const,
    trackIndex: 3,
    startMs: 0,
    endMs: 5000,
    sourceInMs: 0,
    sourceDurationMs: 5000,
    speed: 1.0,
    volume: 1.0,
    transform: { scale: 1, offsetX: 0, offsetY: 0, rotation: 0, opacity: 1 },
    look: { brightness: 0, contrast: 1, saturation: 1 },
    transition: {},
    hidden: false,
  };

  const addRes1 = addClip(baseProject, testVideoClip);
  assert(addRes1.success && addRes1.project.clips.length === 1, 'addClip successful on valid track');

  // Test 2b: Add clip to illegal track should fail
  const illegalTextClip = { ...testVideoClip, type: 'text' as const, trackIndex: 1 };
  const addRes2 = addClip(baseProject, illegalTextClip);
  assert(!addRes2.success, 'addClip rejected when clip type does not match track');

  // Test 3: Move clip
  const moveRes = moveClip(addRes1.project, 'c_vid_1', 2000);
  assert(
    moveRes.success && moveRes.project.clips[0].startMs === 2000 && moveRes.project.clips[0].endMs === 7000,
    'moveClip moves start and end while preserving duration'
  );

  // Test 4: Trim clip
  const trimRes = trimClip(addRes1.project, 'c_vid_1', 1000, 4500, true);
  assert(
    trimRes.success && trimRes.project.clips[0].startMs === 1000 && trimRes.project.clips[0].endMs === 4500,
    'trimClip correctly trims clip bounds'
  );

  // Test 5: Split clip at playhead
  const splitRes = splitClipAtPlayhead(addRes1.project, 'c_vid_1', 2500);
  assert(
    splitRes.success &&
      splitRes.project.clips.length === 2 &&
      splitRes.project.clips[0].endMs === 2500 &&
      splitRes.project.clips[1].startMs === 2500,
    'splitClipAtPlayhead splits clip into two contiguous segments'
  );

  // Test 6: Ripple delete clip
  const rippleProject: Project = {
    ...baseProject,
    clips: [
      { ...testVideoClip, id: 'c1', startMs: 0, endMs: 3000 },
      { ...testVideoClip, id: 'c2', startMs: 3000, endMs: 6000 },
      { ...testVideoClip, id: 'c3', startMs: 6000, endMs: 9000 },
    ],
  };
  const rippleRes = rippleDeleteClip(rippleProject, 'c2');
  const remainingC3 = rippleRes.clips.find(c => c.id === 'c3');
  assert(
    rippleRes.clips.length === 2 && remainingC3?.startMs === 3000,
    'rippleDeleteClip shifts following clips left by deleted duration'
  );

  // Test 7: Close gaps on track
  const gappedProject: Project = {
    ...baseProject,
    clips: [
      { ...testVideoClip, id: 'g1', startMs: 0, endMs: 2000 },
      { ...testVideoClip, id: 'g2', startMs: 4000, endMs: 6000 },
      { ...testVideoClip, id: 'g3', startMs: 9000, endMs: 11000 },
    ],
  };
  const closedGaps = closeGapsOnTrack(gappedProject, 3);
  const track3Clips = closedGaps.clips.sort((a, b) => a.startMs - b.startMs);
  assert(
    track3Clips[0].startMs === 0 &&
      track3Clips[1].startMs === 2000 &&
      track3Clips[2].startMs === 4000,
    'closeGapsOnTrack compacts all clips flush against each other'
  );

  // Test 8: Change clip speed
  const speedRes = changeClipSpeed(addRes1.project, 'c_vid_1', 2.0);
  assert(
    speedRes.clips[0].speed === 2.0 && speedRes.clips[0].endMs === 2500,
    'changeClipSpeed (2.0x) halves the timeline duration'
  );

  // Test 9: Undo/Redo snapshot stack
  const undoStack = new TimelineUndoRedoStack(baseProject);
  assert(!undoStack.canUndo(), 'undoStack initially has no undo');
  undoStack.push(addRes1.project);
  assert(undoStack.canUndo(), 'undoStack can undo after push');
  const undone = undoStack.undo();
  assert(undone?.clips.length === 0, 'undo restored base state with 0 clips');
  const redone = undoStack.redo();
  assert(redone?.clips.length === 1, 'redo restored state with 1 clip');

  // Test 10: FFmpeg Builder validation
  const ffmpegRes = buildFFmpegCommand(addRes1.project, {
    aspectRatio: '16:9',
    resolution: '1080p',
    fps: 30,
    quality: 'high',
    outputFileName: 'test_export.mp4',
  });
  assert(
    ffmpegRes.command.includes('ffmpeg') &&
      ffmpegRes.command.includes('-filter_complex') &&
      ffmpegRes.command.includes('libx264'),
    'buildFFmpegCommand produces executable ffmpeg command line'
  );

  const passedCount = results.filter(r => r.passed).length;
  return { total: results.length, passed: passedCount, results };
}
