export interface INMPStats {
  downloads: number;
  start: string;
  end: string;
  package: string;
}

export function instanceOfNMPStats(object: any): object is INMPStats {
  return typeof object.package === 'string';
}

export interface INMPStatsError {
  error: string;
}
