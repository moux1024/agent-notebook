import type { TopologyNodeId } from "../content/steps";
import { topologyNodes } from "../content/steps";

export default function TopologyStrip({ activeNodes }: { activeNodes: Set<TopologyNodeId> }) {
  return (
    <div className="topology" role="img" aria-label="算力地图：当前步骤动用的资源">
      {topologyNodes.map((n, i) => (
        <span key={n.id} className="topo-seg">
          {i > 0 && <span className="topo-link" aria-hidden />}
          <span className={`topo-node${activeNodes.has(n.id) ? " active" : ""}`}>
            <span className="topo-icon" aria-hidden>
              {n.icon}
            </span>
            <span className="topo-label">{n.label}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
