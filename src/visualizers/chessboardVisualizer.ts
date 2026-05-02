import * as d3 from 'd3';
import type { ChessboardStep } from '@/types/algorithm';
import { resolveChessboardCellColor, VISUALIZATION_COLOR_TOKENS } from './colorSemantics';
import { resolveCssColorToken } from './resolveCssColorToken';

interface ChessboardRenderContext {
  svgElement: SVGSVGElement;
  step: ChessboardStep;
  transform: string;
}

const CELL_SIZE = 52;
const PADDING = 40;

export function getChessboardBounds(size: number) {
  const boardSize = size * CELL_SIZE;
  return {
    minX: -PADDING,
    maxX: boardSize + PADDING,
    minY: -PADDING,
    maxY: boardSize + PADDING + 30,
  };
}

export function renderChessboard(context: ChessboardRenderContext): void {
  const { svgElement, step, transform } = context;
  const svg = d3.select(svgElement);
  const n = step.size;
  const boardSize = n * CELL_SIZE;

  svg.selectAll('g.chessboard-root').remove();
  const root = svg.append('g').attr('class', 'chessboard-root');
  root.attr('transform', transform);

  const queenSet = new Set(step.queens.map(([r, c]) => `${r},${c}`));

  const lightColor = resolveCssColorToken(svgElement, 'var(--card)');
  const darkColor = resolveCssColorToken(svgElement, 'var(--muted)');
  const textColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.text);
  const idleColor = resolveCssColorToken(svgElement, VISUALIZATION_COLOR_TOKENS.idle);

  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const key = `${row},${col}`;
      const x = col * CELL_SIZE;
      const y = row * CELL_SIZE;
      const isLight = (row + col) % 2 === 0;

      let fill = isLight ? lightColor : darkColor;
      const highlightKind = step.highlights[key];
      if (highlightKind && highlightKind !== 'default') {
        fill = resolveCssColorToken(svgElement, resolveChessboardCellColor(step, key));
      }

      root
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', CELL_SIZE)
        .attr('height', CELL_SIZE)
        .attr('fill', fill)
        .attr('stroke', idleColor)
        .attr('stroke-width', 0.5);

      if (queenSet.has(key)) {
        root
          .append('text')
          .attr('x', x + CELL_SIZE / 2)
          .attr('y', y + CELL_SIZE / 2 + 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', CELL_SIZE * 0.55)
          .attr('fill', textColor)
          .attr('pointer-events', 'none')
          .style('user-select', 'none')
          .text('♛');
      }

      if (
        step.current &&
        step.current[0] === row &&
        step.current[1] === col &&
        !queenSet.has(key)
      ) {
        root
          .append('circle')
          .attr('cx', x + CELL_SIZE / 2)
          .attr('cy', y + CELL_SIZE / 2)
          .attr('r', CELL_SIZE * 0.2)
          .attr('fill', resolveCssColorToken(svgElement, resolveChessboardCellColor(step, key)))
          .attr('opacity', 0.8);
      }
    }
  }

  // Row labels
  for (let row = 0; row < n; row++) {
    root
      .append('text')
      .attr('x', -20)
      .attr('y', row * CELL_SIZE + CELL_SIZE / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', textColor)
      .attr('font-size', 12)
      .text(row);
  }

  // Column labels
  for (let col = 0; col < n; col++) {
    root
      .append('text')
      .attr('x', col * CELL_SIZE + CELL_SIZE / 2)
      .attr('y', boardSize + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', textColor)
      .attr('font-size', 12)
      .text(col);
  }

  // Phase indicator
  const phaseText =
    step.phase === 'done' ? '完成' : step.phase === 'backtracking' ? '回溯中' : '放置中';
  root
    .append('text')
    .attr('x', boardSize / 2)
    .attr('y', boardSize + 36)
    .attr('text-anchor', 'middle')
    .attr('fill', textColor)
    .attr('font-size', 13)
    .attr('font-weight', '600')
    .text(phaseText);
}
