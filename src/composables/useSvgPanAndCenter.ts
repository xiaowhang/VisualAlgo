import { computed, ref } from 'vue';

interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function resolveSvgElement(target: EventTarget | null) {
  if (target instanceof SVGSVGElement) {
    return target;
  }

  if (target instanceof Element) {
    const nestedSvg = target.querySelector('svg');
    if (nestedSvg instanceof SVGSVGElement) {
      return nestedSvg;
    }
  }

  return null;
}

function toSvgPoint(svgElement: SVGSVGElement, event: PointerEvent) {
  const screenMatrix = svgElement.getScreenCTM();
  if (!screenMatrix) {
    return null;
  }

  const point = svgElement.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const svgPoint = point.matrixTransform(screenMatrix.inverse());
  return {
    x: svgPoint.x,
    y: svgPoint.y,
  };
}

export function useSvgPanAndCenter(disabled: () => boolean) {
  const offsetX = ref(0);
  const offsetY = ref(0);
  const dragging = ref(false);

  let startClientX = 0;
  let startClientY = 0;
  let activeSvgElement: SVGSVGElement | null = null;
  let previousSvgX = 0;
  let previousSvgY = 0;

  function handlePointerMove(event: PointerEvent) {
    if (!dragging.value) {
      return;
    }

    if (activeSvgElement) {
      const currentPoint = toSvgPoint(activeSvgElement, event);
      if (currentPoint) {
        const deltaX = currentPoint.x - previousSvgX;
        const deltaY = currentPoint.y - previousSvgY;

        offsetX.value += deltaX;
        offsetY.value += deltaY;

        previousSvgX = currentPoint.x;
        previousSvgY = currentPoint.y;
      }
    } else {
      const deltaX = event.clientX - startClientX;
      const deltaY = event.clientY - startClientY;

      offsetX.value += deltaX;
      offsetY.value += deltaY;
    }

    startClientX = event.clientX;
    startClientY = event.clientY;
  }

  function handlePointerUp() {
    dragging.value = false;
    activeSvgElement = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  function onPointerDown(event: PointerEvent) {
    if (disabled()) {
      return;
    }

    activeSvgElement = resolveSvgElement(event.currentTarget);

    dragging.value = true;
    startClientX = event.clientX;
    startClientY = event.clientY;

    if (activeSvgElement) {
      const startPoint = toSvgPoint(activeSvgElement, event);
      if (startPoint) {
        previousSvgX = startPoint.x;
        previousSvgY = startPoint.y;
      }
    }

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
