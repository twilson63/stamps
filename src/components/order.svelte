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

<div class="card w-148 bg-primary text-primary-content">
  <div class="card-body">
    <h2 class="card-title">Sell Order</h2>
    <p>id: {order.id}</p>
    <div class="stats bg-primary text-primary-content">
      <div class="stat">
        <div class="stat-title">Available for Sale</div>
        <div class="stat-value">{Number(order.quantity) / 1e12}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Total Quantity</div>
        <div class="stat-value">{Number(order.originalQuantity) / 1e12}</div>
      </div>
      <div class="stat">
        <div class="stat-title">Price in $BAR</div>
        <div class="stat-value">
          {Math.fround(order.price * 1e6).toFixed(2)}
        </div>
      </div>
    </div>
    <button class="btn" on:click={() => cancelOrder(order.id)}
      >Cancel Order</button
    >
  </div>
</div>
