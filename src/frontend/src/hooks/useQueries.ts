import { useQuery } from "@tanstack/react-query";
import type { VideoEntry } from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetVideos() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<VideoEntry[]>({
    queryKey: ["videos", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getVideos(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
