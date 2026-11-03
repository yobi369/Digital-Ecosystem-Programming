import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CladeNode } from '../types/ecosystem';
import { GitFork, RefreshCw, Layers } from 'lucide-react';

interface CladeTreeVisualizerProps {
  cladeData: CladeNode;
  onSelectSpecies?: (speciesName: string) => void;
}

export const CladeTreeVisualizer: React.FC<CladeTreeVisualizerProps> = ({
  cladeData,
  onSelectSpecies,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !cladeData) return;

    const width = 800;
    const height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', 'translate(80, 20)');

    const treeLayout = d3.tree<CladeNode>().size([height - 40, width - 220]);

    const root = d3.hierarchy<CladeNode>(cladeData);
    treeLayout(root);

    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(168, 85, 247, 0.4)')
      .attr('stroke-width', 2)
      .attr(
        'd',
        d3
          .linkHorizontal<any, any>()
          .x((d) => d.y)
          .y((d) => d.x)
      );

    // Nodes
    const node = g
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (_, d) => {
        if (onSelectSpecies && d.data.name !== 'Common Ancestral Archea') {
          onSelectSpecies(d.data.name);
        }
      });

    // Node circles
    node
      .append('circle')
      .attr('r', (d) => Math.min(18, Math.max(7, Math.sqrt(d.data.aliveCount || 1) * 3.5)))
      .attr('fill', (d) => d.data.color || '#a855f7')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))');

    // Labels
    node
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d) => (d.children ? -15 : 15))
      .style('text-anchor', (d) => (d.children ? 'end' : 'start'))
      .text((d) => `${d.data.name} (${d.data.aliveCount})`)
      .attr('fill', '#e9d5ff')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', '600');
  }, [cladeData, onSelectSpecies]);

  return (
    <div className="w-full bg-[#0d071a] border border-purple-900/50 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-fuchsia-400" />
          <span className="text-xs font-mono font-bold text-purple-200 uppercase tracking-wider">
            Phylogenetic Lineage & Speciation Clades
          </span>
        </div>
        <span className="text-[11px] font-mono text-purple-400">D3 Hierarchical Tree</span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} viewBox="0 0 800 480" className="w-full h-[320px] select-none"></svg>
      </div>
    </div>
  );
};
