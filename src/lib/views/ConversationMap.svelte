<script lang="ts">
	import { Message, MessageGroup, addMapMessageGroup,
					allMessageGroups, allMessages } from '$lib/client/stores';
	import { MessageStream, SYS_MESSAGE_TEACHER } from '$lib/client/util';
	import ChatInput from '$lib/components/ChatInput.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import type * as Req from '$lib/request_types'
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
	let curIsland: Island | null = null;

	let chatInput: string = "";
	let curPrompt : Message = new Message({content: "", role:"user"});
	let curAnswer : Message = new Message({content: "", role:"assistant"});

	$ : {
		let groupMessages: Record<string, Message[]> = {};
		let groups: Record<string, MessageGroup> = {};
		$allMessageGroups.map((g) => {
			if (g.ref_type === "map") {
				groupMessages[g.id] = [];
				groups[g.id] = g;
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
		if (curIsland === null && islands.length) {
			curIsland = islands[0];
		}
		console.log(curIsland)

	}

	

	async function sendMessage(content: string) {
		if (!curIsland) {
			return console.warn("No active group");
		}
		
		curPrompt.content = content;
		curPrompt.groupId = curIsland.group.id;
    
    const body: Req.Chat = { 
      messages: [
        SYS_MESSAGE_TEACHER,
        ...curIsland.messages.map(({content, role}) => ({
          content,
          role
        })), {
					content: curPrompt.content,
					role: curPrompt.role,
				}
      ]
    };

    const messageStream = MessageStream(body);
    
    curAnswer.groupId = curIsland.group.id;

    for await (let part of messageStream){
      curAnswer.content += part;
    }
    curPrompt = await Message.collection.add(curPrompt);
    curAnswer = await Message.collection.add(curAnswer);
		$allMessages = [...$allMessages, curPrompt, curAnswer];
		curPrompt = new Message({content: "", role: "user"})
		curAnswer = new Message({content: "", role: "assistant"})
	}

	async function addGroup(){
		let { x, y } = getScreenCenter();
		let group = await addMapMessageGroup(x, y);
		if (group) {
			curIsland = {group, messages: []};
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
		console.log(scaleLevel);

		const v = 0.2;
		let delta = event.deltaY * -0.01;
		if (scaleLevel + delta < -18) {
			return;
		}
		if (scaleLevel + delta > 5) {
			return;
		}
		let { clientWidth, clientHeight } = mapRoot;

		let prevTl = getTopLeft();
		let prevScale = scale;
		let oldSize = {
			x: clientWidth * prevScale,
			y: clientHeight * prevScale,
		}
		scaleLevel += delta;
		let base = scaleLevel < 0 ? 1.12 : 1.25;
		scale = Math.pow(base, scaleLevel);
		let newSize = {
			x: clientWidth * scale,
			y: clientHeight * scale,
		}
		const deltaWidth = oldSize.x - newSize.x;
		const deltaHeight = oldSize.y - newSize.y;
		const newTl = {
			x: prevTl.x - deltaWidth / 2,
			y: prevTl.y - deltaHeight / 2
		}
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
				<div class="shadow-2xl p-4 absolute rounded-xl
									 w-[420px]  min-h-[240px]
									overflow-x-hidden  "
									class:border-4={curIsland?.group.id === group.id}
									class:border-sky-300={curIsland?.group.id === group.id}
									style="left:{group.data.x}px; top:{group.data.y}px;"  
									>
					<!-- each message in group -->
					{#each messages as message}
					<span class="cursor-auto" on:mousedown={None} on:mouseup={None}>
						<ChatMessage {...message}  />
					</span>
					{/each}
					{#if curIsland?.group.id === group.id && chatInput.length}
					<span class="cursor-auto" on:mousedown={None} on:mouseup={None}>
						<ChatMessage content={chatInput} role="user"  />
					</span>
					{/if}
					{#if curIsland?.group.id === group.id && curPrompt.content.length}
					<span class="cursor-auto" on:mousedown={None} on:mouseup={None}>
						<ChatMessage {...curPrompt}  />
					</span>
					{/if}
					{#if curIsland?.group.id === group.id && curAnswer.content.length}
					<span class="cursor-auto" on:mousedown={None} on:mouseup={None}>
						<ChatMessage {...curAnswer}  />
					</span>
					{/if}
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
			<ChatInput onSendMessage={sendMessage} bind:value={chatInput}/>
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
