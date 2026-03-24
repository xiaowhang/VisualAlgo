import { computed, ref } from 'vue';

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function useSvgPanAndCenter(disabled: () => boolean) {
  const offsetX = ref(0);
  const offsetY = ref(0);
  const dragging = ref(false);

  let startClientX = 0;
  let startClientY = 0;

  function handlePointerMove(event: PointerEvent) {
    if (!dragging.value) {
      return;
    }

    const deltaX = event.clientX - startClientX;
    const deltaY = event.clientY - startClientY;

    offsetX.value += deltaX;
    offsetY.value += deltaY;

    startClientX = event.clientX;
    startClientY = event.clientY;
  }

  function handlePointerUp() {
    dragging.value = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  function onPointerDown(event: PointerEvent) {
    if (disabled()) {
      return;
    }

    dragging.value = true;
    startClientX = event.clientX;
    startClientY = event.clientY;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function centerContent(viewWidth: number, viewHeight: number, bounds: Bounds) {
    const contentWidth = Math.max(bounds.maxX - bounds.minX, 1);
    const contentHeight = Math.max(bounds.maxY - bounds.minY, 1);

    offsetX.value = (viewWidth - contentWidth) / 2 - bounds.minX;
    offsetY.value = (viewHeight - contentHeight) / 2 - bounds.minY;
  }

  return {
    offsetX,
    offsetY,
    transform: computed(() => `translate(${offsetX.value}, ${offsetY.value})`),
    onPointerDown,
    centerContent,
  };
}
