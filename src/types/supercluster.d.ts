declare module 'supercluster' {
  export interface ClusterProperties {
    cluster_id: number;
    point_count: number;
    point_count_abbreviated?: string;
  }

  export interface ClusterFeature {
    type: 'Feature';
    properties: ClusterProperties;
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
  }

  export interface SuperclusterOptions {
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    minPoints?: number;
    extent?: number;
    nodeSize?: number;
    log?: boolean;
    generateId?: boolean;
    reduce?: (accumulated: any, props: any) => void;
    map?: (props: any) => any;
  }

  export default class Supercluster {
    constructor(options?: SuperclusterOptions);
    load(points: any[]): this;
    getClusters(bbox: [number, number, number, number], zoom: number): ClusterFeature[];
    getChildren(clusterId: number): any[];
    getLeaves(clusterId: number, limit?: number, offset?: number): any[];
    getTile(z: number, x: number, y: number): any;
    getClusterExpansionZoom(clusterId: number): number;
  }
}
