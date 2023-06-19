<script lang="ts">
	import { Message, MessageGroup, addMapMessageGroup,
					allMessageGroups, allMessages } from '$lib/client/stores';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import { onDestroy, onMount } from 'svelte';
	import IoIosAddCircleOutline from 'svelte-icons/io/IoIosAddCircleOutline.svelte';

	let scaleLevel = 0;
	let scale = 1.0;
	let mapRoot: HTMLElement;
	let mapWorld: HTMLElement;
	let start = { x: 0, y: 0 };
	let scroll = { top: 5000, left: 5000 };
	let mousePos = { x: 0, y: 0 };
	interface Island {
		group: MessageGroup;
		messages: Message[];
	}
	let islands: Island[] = [];
	let curGroup: MessageGroup | null = null;

	$ : {
		let groupMessages: Record<string, Message[]> = {};
		let groups: Record<string, MessageGroup> = {};
		$allMessageGroups.map((g) => {
			if (g.ref_type === "map") {
				groupMessages[g.id] = [];
				groups[g.id] = g;
				if (curGroup === null) {
					curGroup = g;
				}
			}
		})

		$allMessages.map((m) => {
			if (m.groupId && m.groupId in groupMessages) {
				groupMessages[m.groupId].push(m);
			}
		})
		islands = Object.keys(groups).map((id) => ({
			group: groups[id],
			messages: groupMessages[id]
		}))
		console.log(curGroup)

	}


	async function sendMessage(content: string) {
		if (!curGroup) {
			return console.warn("No active group");
		}
		let message = await Message.collection.add({
			content,
			role: "user",
			groupId: curGroup.id
		})
		$allMessages = [...$allMessages, message];
	}

	async function addGroup(){
		let { x, y } = getScreenCenter();
		let group = await addMapMessageGroup(x, y);
		if (group) {
			curGroup = group;
			$allMessageGroups = [...$allMessageGroups, group]
		}
	}

	function onHighlight() {
		let selection = document.getSelection();
		let selectedText = selection?.toString();
		if (selectedText?.length) {
			// console.log(selectedText);
			// if (selectedText.length > 5) {
			//   alert(selectedText);
			// }
		}
	}

	let initOnChild = false;

	onMount(() => {
		document.addEventListener('selectionchange', onHighlight);
		scroll.top -= mapRoot.clientHeight / (2 * scale);
		scroll.left -= mapRoot.clientWidth / (2 * scale);
		mapRoot.scrollTop = scroll.top;
		mapRoot.scrollLeft = scroll.left;
	});

	onDestroy(() => {
		document.removeEventListener('selectionchange', onHighlight);
	});

	function onMouseDown(event: MouseEvent) {
		initOnChild = false;
		start = { x: event.clientX, y: event.clientY };
		if (!event.currentTarget) return;
		const currentTarget = event.currentTarget as HTMLElement;
		scroll = { top: currentTarget.scrollTop, left: currentTarget.scrollLeft };
		(event.currentTarget as HTMLElement).style.cursor = 'grabbing';
	}

	function onMouseMove(event: MouseEvent) {
		updateMousePosition(event.clientX, event.clientY);
		if (event.buttons !== 1 || initOnChild) return;
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		mapRoot.scrollTop = scroll.top - dy;
		mapRoot.scrollLeft = scroll.left - dx;
	}

	function onMouseUp(event: MouseEvent) {
		(event.currentTarget as HTMLElement).style.cursor = 'grab';
	}

	function getTopLeft() {
		const { scrollTop, scrollLeft, offsetTop, offsetLeft } = mapRoot;
		return { x: scrollLeft - offsetLeft, y: scrollTop - offsetTop };
	}

	function updateMousePosition(dx = 0, dy = 0) {
		let tl = getTopLeft();
		mousePos.x = tl.x + dx / scale;
		mousePos.y = tl.y + dy / scale;
		// console.log(tl, mousePos);
	}

	function getScreenCenter() {
		let { clientWidth, clientHeight } = mapRoot;

		let tl = getTopLeft();
		return {
			x: tl.x + clientWidth / (2 * scale),
			y: tl.y + clientHeight / (2 * scale)
		};
	}

	function zoom(event: WheelEvent) {
		event.preventDefault();
		// velocity -> 1.0 straight to middle
		const v = 0.2;
		let delta = event.deltaY * -0.01;
		let { clientWidth, clientHeight } = mapRoot;

		let prevTl = getTopLeft();
		let prevCenter = getScreenCenter();
		let prevMousePos = mousePos;
		let prevScale = scale;
		scaleLevel += delta;
		let base = scaleLevel < 0 ? 1.12 : 1.25;
		scale = Math.pow(base, scaleLevel);
		let scaleChange = scale / prevScale;
		let newCenter = {
			x: v * mousePos.x + (1 - v) * prevCenter.x,
			y: v * mousePos.y + (1 - v) * prevCenter.y
		};
		let newTl = {
			x: newCenter.x - clientWidth / (2 * scale),
			y: newCenter.y - clientHeight / (2 * scale)
		};
		// console.log("\n", scale, getTopLeft(), mousePos);
		// console.log(prevScale, scale)
		mapWorld.style.transform = `scale(${scale})`;
		scroll.top = newTl.y;
		scroll.left = newTl.x;
		mapRoot.scrollTop = scroll.top;
		mapRoot.scrollLeft = scroll.left;
	}
	const None = (event: UIEvent) => {
		event.stopPropagation();
		initOnChild = true;
	};
</script>

<!-- root to contain floating chatinput also -->
<div class="bg-gray-300 w-full h-full overflow-hidden relative">
	<!-- scrollable container of world -->
	<div
		class="cursor-grab overflow-scroll w-full h-full relative"
		on:mousedown={onMouseDown}
		on:mousemove={onMouseMove}
		on:mouseup={onMouseUp}
		on:wheel={zoom}
		bind:this={mapRoot}
	>
		<!-- whole world  -->
		<div class="bg-gray-100 w-[10000px] h-[10000px] absolute" bind:this={mapWorld}>
			{#each islands as { group, messages }}
				<!-- content here -->
				<!-- each message group -->
				<div class="shadow-2xl p-4 border-2 absolute rounded-xl
									 w-56 max-h-[960px] min-h-[240px] overflow-y-scroll overflow-x-hidden"
						style="left:{group.data.x}px; top:{group.data.y}px;"  on:wheel={None}>
					<!-- each message in group -->
					{#each messages as { content }}
					<span class="cursor-auto" on:mousedown={None} on:mouseup={None}>
						<ChatMessage {content} />
					</span>
					{/each}
				</div>
			{/each}
		</div>
	</div>
	<div class="ui">
		<div class="absolute flex flex-row-reverse top-10">
			<div
				class="group w-12 h-12 x-icon
								  mx-0 bg-gray-800 text-gray-300"
				on:click={addGroup}
			>
				<IoIosAddCircleOutline />
				<span class="x-icon-tooltip group-hover:scale-100"> Add island </span>
			</div>
		</div>
		<div class="absolute px-6 bottom-6 mx-auto">
			<ChatInput onSendMessage={sendMessage} />
		</div>
	</div>
</div>

<style>
	.ui > * {
		max-width: 720px;
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
		position: absolute;
		z-index: 10;
	}
	/* Add custom scrollbar styles */
	::-webkit-scrollbar {
		width: 0px;
		height: 0px;
	}

	::-webkit-scrollbar-track {
		background-color: black;
		border-radius: 0px;
	}

	::-webkit-scrollbar-thumb {
		background-color: ghostwhite;
		border-radius: 4px;
		width: 40px;
		height: 40px;
	}
</style>
