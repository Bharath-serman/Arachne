import { FilmOverlay } from "@/components/experience/FilmOverlay";
import { useSmoothScroll } from "@/lib/use-smooth-scroll";

type HomeRuntimeProps = {
  sync: () => void;
  visible: boolean;
};

/** Home-only browser runtime; kept out of the landing request and render tree. */
export function HomeRuntime({ sync, visible }: HomeRuntimeProps) {
  useSmoothScroll(sync, visible);
  return <FilmOverlay />;
}
