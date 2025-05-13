import { useSvgDrag, useSvgCenter } from '@/composable'

export function useSvg(drawCallback: () => void) {
  const { centerSvg } = useSvgCenter(drawCallback)

  useSvgDrag(drawCallback)

  return {
    centerSvg,
  }
}
