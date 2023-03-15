<script>
  // @ts-nocheck

  import { Route, router } from "tinro";
  import Announcer from "./components/announcer.svelte";
  import Transition from "./components/transition.svelte";

  //import Home from "./pages/home.svelte";
  import Home from "./pages/home2.svelte";
  import About from "./pages/about.svelte";
  import Player from "./pages/player.svelte";
  import Rewards from "./pages/rewards.svelte";

  router.mode.hash();
  router.subscribe((_) => window.scrollTo(0, 0));
</script>

<Announcer />
<Transition>
  <Route path="/">
    <Home />
  </Route>
  <Route path="/about">
    <About />
  </Route>
  <Route path="/player/:addr" let:meta>
    <Player addr={meta.params.addr} />
  </Route>
  <Route path="/rewards/:asset" let:meta>
    <Rewards asset={meta.params.asset} />
  </Route>
</Transition>
