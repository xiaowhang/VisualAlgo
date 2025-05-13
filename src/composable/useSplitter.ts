type Direction = 'horizontal' | 'vertical'

export function useSplitter(size: Ref<number>, direction: Direction = 'horizontal') {
  const startPosition = ref(0)
  const resizing = ref(false)

  const getClientPos = (e: MouseEvent) => (direction === 'horizontal' ? e.clientX : e.clientY)

  const startResize = (e: MouseEvent) => {
    if (resizing.value) return
    resizing.value = true

    startPosition.value = getClientPos(e)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', stopResize)
  }

  const onMouseMove = (e: MouseEvent) => {
    const currentPos = getClientPos(e)
    const diff = currentPos - startPosition.value
    size.value = Math.max(100, size.value + diff)
    startPosition.value = e.clientX
  }

  const stopResize = () => {
    if (!resizing.value) return
    resizing.value = false

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', stopResize)
  }

  return {
    startResize,
  }
}
