<script lang="ts">
	import { Resource, selectedCourse } from "$lib/client/stores";
	import { closeModal } from "$lib/components/ModalView.svelte";

  async function onChange(e: Event) {
    let target = e.target as HTMLInputElement;
    let file = target.files && target.files[0];
    console.log("Change:", file);
    if (!file) return;
    if (!$selectedCourse) return;
    let resource = await Resource.create(
      $selectedCourse.id, file);
    console.log("Created:", resource);
    closeModal();
  }
</script>


<input type="file" on:change={onChange} />