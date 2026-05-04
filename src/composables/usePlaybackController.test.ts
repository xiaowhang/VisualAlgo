import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { effectScope, nextTick } from 'vue';
import { usePlaybackController } from './usePlaybackController';

function withScope(fn: (controller: ReturnType<typeof usePlaybackController>) => void) {
  const scope = effectScope();
  scope.run(() => {
    const controller = usePlaybackController();
    fn(controller);
  });
  scope.stop();
}

async function withScopeAsync(
  fn: (controller: ReturnType<typeof usePlaybackController>) => Promise<void>
) {
  const scope = effectScope();
  await scope.run(async () => {
    const controller = usePlaybackController();
    await fn(controller);
  });
  scope.stop();
}

describe('usePlaybackController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初始状态', () => {
    withScope(c => {
      expect(c.currentStep.value).toBe(0);
      expect(c.totalSteps.value).toBe(0);
      expect(c.isPlaying.value).toBe(false);
      expect(c.speed.value).toBe(1);
    });
  });

  it('canPlay / canStep：totalSteps <= 1 时为 false', () => {
    withScope(c => {
      c.setTotalSteps(1);
      expect(c.canPlay.value).toBe(false);
      expect(c.canStep.value).toBe(false);
    });
  });

  it('canPlay：totalSteps > 1 且未到末尾时为 true', () => {
    withScope(c => {
      c.setTotalSteps(10);
      expect(c.canPlay.value).toBe(true);
      c.setCurrentStep(9);
      expect(c.canPlay.value).toBe(false);
    });
  });

  it('canStepBack：totalSteps > 1 且 currentStep > 0 时为 true', () => {
    withScope(c => {
      c.setTotalSteps(10);
      expect(c.canStepBack.value).toBe(false);
      c.setCurrentStep(5);
      expect(c.canStepBack.value).toBe(true);
    });
  });

  it('setTotalSteps 负值钳制为 0', () => {
    withScope(c => {
      c.setTotalSteps(-5);
      expect(c.totalSteps.value).toBe(0);
    });
  });

  it('setTotalSteps steps<=1 时暂停', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.play();
      expect(c.isPlaying.value).toBe(true);
      c.setTotalSteps(1);
      expect(c.isPlaying.value).toBe(false);
    });
  });

  it('setTotalSteps currentStep 超限钳制', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.setCurrentStep(9);
      c.setTotalSteps(5);
      expect(c.currentStep.value).toBe(4);
    });
  });

  it('setCurrentStep 钳制到 [0, maxIndex]', () => {
    withScope(c => {
      c.setTotalSteps(5);
      c.setCurrentStep(-3);
      expect(c.currentStep.value).toBe(0);
      c.setCurrentStep(100);
      expect(c.currentStep.value).toBe(4);
    });
  });

  it('play / pause', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.play();
      expect(c.isPlaying.value).toBe(true);
      c.pause();
      expect(c.isPlaying.value).toBe(false);
    });
  });

  it('play 空操作：totalSteps <= 1', () => {
    withScope(c => {
      c.setTotalSteps(1);
      c.play();
      expect(c.isPlaying.value).toBe(false);
    });
  });

  it('play 空操作：已在末尾', () => {
    withScope(c => {
      c.setTotalSteps(5);
      c.setCurrentStep(4);
      c.play();
      expect(c.isPlaying.value).toBe(false);
    });
  });

  it('step 前进一步并暂停', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.play();
      c.step();
      expect(c.isPlaying.value).toBe(false);
      expect(c.currentStep.value).toBe(1);
    });
  });

  it('step 边界：到末尾不再前进', () => {
    withScope(c => {
      c.setTotalSteps(3);
      c.setCurrentStep(2);
      c.step();
      expect(c.currentStep.value).toBe(2);
    });
  });

  it('stepBack 后退一步并暂停', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.setCurrentStep(5);
      c.stepBack();
      expect(c.isPlaying.value).toBe(false);
      expect(c.currentStep.value).toBe(4);
    });
  });

  it('stepBack 边界：在起点不再后退', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.setCurrentStep(0);
      c.stepBack();
      expect(c.currentStep.value).toBe(0);
    });
  });

  it('setSpeed 钳制到 [0.5, 2.0]', () => {
    withScope(c => {
      c.setSpeed(0.1);
      expect(c.speed.value).toBe(0.5);
      c.setSpeed(3);
      expect(c.speed.value).toBe(2);
      c.setSpeed(1.5);
      expect(c.speed.value).toBe(1.5);
    });
  });

  it('seekTo 先暂停再跳转', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.play();
      c.seekTo(7);
      expect(c.isPlaying.value).toBe(false);
      expect(c.currentStep.value).toBe(7);
    });
  });

  it('reset 暂停并回到起点', () => {
    withScope(c => {
      c.setTotalSteps(10);
      c.setCurrentStep(5);
      c.play();
      c.reset();
      expect(c.isPlaying.value).toBe(false);
      expect(c.currentStep.value).toBe(0);
    });
  });

  it('progressPercent：totalSteps <= 1 返回 0', () => {
    withScope(c => {
      expect(c.progressPercent.value).toBe(0);
      c.setTotalSteps(1);
      expect(c.progressPercent.value).toBe(0);
    });
  });

  it('progressPercent 正确计算', () => {
    withScope(c => {
      c.setTotalSteps(11);
      c.setCurrentStep(5);
      expect(c.progressPercent.value).toBe(50);
    });
  });

  it('定时器自动前进', async () => {
    await withScopeAsync(async c => {
      c.setTotalSteps(10);
      c.play();
      await nextTick();
      expect(c.currentStep.value).toBe(0);
      vi.advanceTimersByTime(850);
      await nextTick();
      expect(c.currentStep.value).toBe(1);
      vi.advanceTimersByTime(850);
      await nextTick();
      expect(c.currentStep.value).toBe(2);
    });
  });

  it('定时器到末尾自动暂停', async () => {
    await withScopeAsync(async c => {
      c.setTotalSteps(3);
      c.play();
      await nextTick();
      vi.advanceTimersByTime(850);
      await nextTick();
      vi.advanceTimersByTime(850);
      await nextTick();
      // At step 2 (last), next timer tick will detect end and pause
      vi.advanceTimersByTime(850);
      await nextTick();
      expect(c.currentStep.value).toBe(2);
      expect(c.isPlaying.value).toBe(false);
    });
  });
});
