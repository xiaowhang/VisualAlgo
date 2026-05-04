import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAlgorithmPlaybackStore } from './algorithmPlayback';

describe('useAlgorithmPlaybackStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('初始状态', () => {
    it('currentStep=0, totalSteps=0, isPlaying=false, speed=1', () => {
      const store = useAlgorithmPlaybackStore();

      expect(store.currentStep).toBe(0);
      expect(store.totalSteps).toBe(0);
      expect(store.isPlaying).toBe(false);
      expect(store.speed).toBe(1);
    });

    it('compareContinueLonger 默认为 true', () => {
      const store = useAlgorithmPlaybackStore();
      expect(store.compareContinueLonger).toBe(true);
    });
  });

  describe('setCompareContinueLonger', () => {
    it('正确更新', () => {
      const store = useAlgorithmPlaybackStore();

      store.setCompareContinueLonger(false);
      expect(store.compareContinueLonger).toBe(false);

      store.setCompareContinueLonger(true);
      expect(store.compareContinueLonger).toBe(true);
    });
  });

  describe('继承 playback controller 的所有方法', () => {
    it('setTotalSteps / setCurrentStep', () => {
      const store = useAlgorithmPlaybackStore();

      store.setTotalSteps(10);
      expect(store.totalSteps).toBe(10);

      store.setCurrentStep(5);
      expect(store.currentStep).toBe(5);
    });

    it('play / pause', () => {
      const store = useAlgorithmPlaybackStore();

      store.setTotalSteps(10);
      store.play();
      expect(store.isPlaying).toBe(true);

      store.pause();
      expect(store.isPlaying).toBe(false);
    });

    it('step / stepBack', () => {
      const store = useAlgorithmPlaybackStore();

      store.setTotalSteps(10);
      store.setCurrentStep(3);

      store.step();
      expect(store.currentStep).toBe(4);

      store.stepBack();
      expect(store.currentStep).toBe(3);
    });

    it('setSpeed 钳制到 [0.5, 2]', () => {
      const store = useAlgorithmPlaybackStore();

      store.setSpeed(0.1);
      expect(store.speed).toBe(0.5);

      store.setSpeed(3);
      expect(store.speed).toBe(2);

      store.setSpeed(1.5);
      expect(store.speed).toBe(1.5);
    });

    it('reset 归零当前步并暂停', () => {
      const store = useAlgorithmPlaybackStore();

      store.setTotalSteps(10);
      store.setCurrentStep(5);
      store.reset();

      expect(store.currentStep).toBe(0);
      expect(store.isPlaying).toBe(false);
    });

    it('seekTo 暂停并跳转到指定步', () => {
      const store = useAlgorithmPlaybackStore();

      store.setTotalSteps(10);
      store.play();
      store.seekTo(7);

      expect(store.isPlaying).toBe(false);
      expect(store.currentStep).toBe(7);
    });

    it('canPlay / canStep / canStepBack 计算正确', () => {
      const store = useAlgorithmPlaybackStore();

      store.setTotalSteps(1);
      expect(store.canPlay).toBe(false);
      expect(store.canStep).toBe(false);
      expect(store.canStepBack).toBe(false);

      store.setTotalSteps(10);
      expect(store.canPlay).toBe(true);
      expect(store.canStep).toBe(true);
      expect(store.canStepBack).toBe(false);

      store.setCurrentStep(5);
      expect(store.canPlay).toBe(true);
      expect(store.canStep).toBe(true);
      expect(store.canStepBack).toBe(true);

      store.setCurrentStep(9);
      expect(store.canPlay).toBe(false);
      expect(store.canStep).toBe(false);
      expect(store.canStepBack).toBe(true);
    });

    it('progressPercent 计算正确', () => {
      const store = useAlgorithmPlaybackStore();

      store.setTotalSteps(1);
      expect(store.progressPercent).toBe(0);

      store.setTotalSteps(11);
      store.setCurrentStep(0);
      expect(store.progressPercent).toBe(0);

      store.setCurrentStep(5);
      expect(store.progressPercent).toBe(50);

      store.setCurrentStep(10);
      expect(store.progressPercent).toBe(100);
    });
  });
});
