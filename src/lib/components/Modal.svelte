<script lang="ts">
  export let label: string = "Modal";
  export let modalId: string = "my-modal";
</script>

<style>

</style>


<slot name="entry">
  <label for={modalId}>
    {label}
  </label>
</slot>
<input type="checkbox" id={modalId} class="modal-toggle" />
<label for={modalId} class="modal cursor-pointer">
  <div class="modal-box">
    <slot>
      Modal Content
    </slot>
  </div>
</label>
