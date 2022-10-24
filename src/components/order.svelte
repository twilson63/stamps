<script>
  import { cancelOrder } from "../lib/app.js";

  export let order = {
    id: "s27eDFgwtraSH4hbWHVH7yOhNohOYChsVkGO2dOC3YU",
    transfer: "INTERNAL_TRANSFER",
    creator: "AdPC5pHq0IRC2EWdkPnjni_t-hzwD5QuskF1qe4xGHU",
    token: "jAE_V6oXkb0dohIOjReMhrTlgLW0X2j3rxIZ5zgbjXw",
    price: 0.000001,
    quantity: 1e12,
    originalQuantity: 1e12,
  };
</script>

<div class="flex flex-col">
  <h3>Open Order</h3>
  <p>id: {order.id}</p>
  <p>Quantity Available: {Number(order.quantity) / 1e12}</p>
  <p>Original Quantity: {Number(order.originalQuantity) / 1e12}</p>
  <p>Price: {order.price * 1e6}</p>
  <button class="btn" on:click={() => cancelOrder(order.id)}>Cancel</button>
</div>
