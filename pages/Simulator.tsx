
import React, { useState, useCallback, useEffect } from 'react';
import { SystemConfig, CacheLevelConfig, BenchmarkResult, RegisterFile, BenchmarkMetrics } from '../types';
import { PlayIcon, CodeBracketIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '../components/icons';
import CodeEditor from '../components/CodeEditor';
import SystemVisualizer from '../components/SystemVisualizer';

interface SimulatorProps {
    config2D: SystemConfig;
    config3D: SystemConfig;
    onSimulationComplete: (result: BenchmarkResult, registers: RegisterFile) => void;
    theme: 'light' | 'dark';
}

// Log types and interfaces for the new structured logging system
type LogType = 'info' | 'success' | 'warning' | 'error' | 'special';
interface LogEntry {
  message: string;
  type: LogType;
}

type MemoryAccessPattern = 'sequential' | 'random' | 'strided';

const BENCHMARK_EXAMPLES: { [category: string]: { [key: string]: { name: string; code: string } } } = {
    "Sorting": {
        bubble_sort: { name: 'Bubble Sort', code: `# Sorts a small array in memory\nli x1, 1000 # array base\nli x2, 8 # array size\naddi x3, x2, -1\nouter_loop:\n  li x4, 0\n  mv x5, x3\ninner_loop:\n  slli x6, x4, 2\n  add x7, x1, x6\n  lw x8, 0(x7)\n  lw x9, 4(x7)\n  ble x8, x9, no_swap\n  sw x9, 0(x7)\n  sw x8, 4(x7)\nno_swap:\n  addi x4, x4, 1\n  blt x4, x5, inner_loop\n  addi x3, x3, -1\n  bne x3, x0, outer_loop` },
        insertion_sort: { name: 'Insertion Sort', code: `# Sorts an array using insertion sort algorithm\nli x1, 1000 # array base\nli x2, 8    # array size\nli x3, 1    # i = 1\nouter_loop:\n  bge x3, x2, end_sort\n  mv x4, x3 # j = i\ninner_loop:\n  ble x4, x0, next_iter\n  slli t0, x4, 2\n  add t0, x1, t0\n  lw t1, 0(t0)  # key = arr[j]\n  lw t2, -4(t0) # prev = arr[j-1]\n  bge t1, t2, next_iter # if key >= prev, done\n  sw t2, 0(t0)  # swap\n  sw t1, -4(t0)\n  addi x4, x4, -1\n  j inner_loop\nnext_iter:\n  addi x3, x3, 1\n  j outer_loop\nend_sort:` },
        selection_sort: { name: 'Selection Sort', code: `# Sorts an array using selection sort\nli a0, 1000 # array base\nli a1, 8 # array size\nli t0, 0 # i = 0\nouter_loop_ss:\n  bge t0, a1, end_ss\n  mv t1, t0 # min_idx = i\n  addi t2, t0, 1 # j = i + 1\ninner_loop_ss:\n  bge t2, a1, swap_ss\n  slli t3, t1, 2\n  add t3, a0, t3\n  lw t4, 0(t3) # arr[min_idx]\n  slli t5, t2, 2\n  add t5, a0, t5\n  lw t6, 0(t5) # arr[j]\n  blt t4, t6, no_update_min\n  mv t1, t2 # min_idx = j\nno_update_min:\n  addi t2, t2, 1\n  j inner_loop_ss\nswap_ss:\n  # swap arr[i] and arr[min_idx]\n  slli t3, t0, 2\n  add t3, a0, t3\n  lw t4, 0(t3)\n  slli t5, t1, 2\n  add t5, a0, t5\n  lw t6, 0(t5)\n  sw t6, 0(t3)\n  sw t4, 0(t5)\n  addi t0, t0, 1\n  j outer_loop_ss\nend_ss:` },
        quicksort: { name: 'Quicksort (Recursive)', code: `# Recursive quicksort implementation\n# Setup initial call\nli a0, 1000 # array base\nli a1, 0    # low\nli a2, 7    # high\njal ra, quicksort\nend: j end # halt\nquicksort:\n  addi sp, sp, -12\n  sw ra, 8(sp)\n  sw a1, 4(sp)\n  sw a2, 0(sp)\n  bge a1, a2, qs_exit\n  jal ra, partition\n  mv s0, a0 # pivot index\n  lw a1, 4(sp)\n  lw a2, 0(sp)\n  addi a2, s0, -1\n  jal ra, quicksort # recurse left\n  lw a2, 0(sp)\n  addi a1, s0, 1\n  jal ra, quicksort # recurse right\nqs_exit:\n  lw ra, 8(sp)\n  lw a1, 4(sp)\n  lw a2, 0(sp)\n  addi sp, sp, 12\n  jr ra\npartition:\n  # partition logic... (simplified)\n  jr ra` },
        merge_sort: { name: 'Merge Sort (Conceptual)', code: `# Conceptual recursive merge sort\nli a0, 1000 # array base\nli a1, 0\nli a2, 7\njal ra, merge_sort\nend_ms: j end_ms\nmerge_sort:\n  # ... recursive splitting logic ...\n  # jal ra, merge_sort (left half)\n  # jal ra, merge_sort (right half)\n  # ... merge logic ...\n  jr ra`},
        heap_sort: { name: 'Heap Sort (Conceptual)', code: `# Conceptual heap sort\nli a0, 1000 # array base\nli a1, 8 # size\n# Build heap (rearrange array)\nli t0, 0\nbuild_heap_loop:\n  # ... heapify logic ...\n  addi t0, t0, 1\n  blt t0, a1, build_heap_loop\n# Extract elements from heap\nextract_loop:\n  # ... swap root with end, reduce heap size, heapify root ...\n  j extract_loop`},
        radix_sort: { name: 'Radix Sort (Conceptual)', code: `# Simplified Radix Sort (LSD, one pass on LSB)\n# This is a conceptual, non-working example for performance modeling\nli a0, 1000 # array base\nli a1, 16 # size\nli s0, 2000 # count array (256 bytes for LSB)\nli s1, 3000 # output array\n# Step 1: Clear count array\n# ... loop to zero out s0 ...\n# Step 2: Count frequencies of LSB\nli t0, 0\ncount_loop:\n  lw t1, 0(a0)\n  andi t1, t1, 0xFF # get LSB\n  # ... increment count[t1] ...\n  addi a0, a0, 4\n  addi t0, t0, 1\n  blt t0, a1, count_loop\n# Step 3: Calculate cumulative counts\n# ... loop to sum up counts ...\n# Step 4: Build output array from original\n# ... loop backwards through original array ...\n# Step 5: Copy output array back to original\n# ... simple memcpy loop ...` },
        cocktail_shaker_sort: { name: 'Cocktail Shaker Sort', code: `# Sorts an array using Cocktail Shaker sort (bidirectional bubble sort)\nli a0, 1000 # array base\nli s0, 0 # left index\nli s1, 7 # right index (size - 1)\nloop_css:\n  # Forward pass (like bubble sort)\n  mv t0, s0\nforward_pass:\n  lw t1, 0(a0)\n  lw t2, 4(a0)\n  ble t1, t2, skip_fwd_swap\n  sw t2, 0(a0)\n  sw t1, 4(a0)\nskip_fwd_swap:\n  addi a0, a0, 4\n  addi t0, t0, 1\n  blt t0, s1, forward_pass\n  addi s1, s1, -1 # shrink right bound\n  # Backward pass\n  mv t0, s1\nbackward_pass:\n  lw t1, 0(a0)\n  lw t2, -4(a0)\n  bge t1, t2, skip_bwd_swap\n  sw t2, 0(a0)\n  sw t1, -4(a0)\nskip_bwd_swap:\n  addi a0, a0, -4\n  addi t0, t0, -1\n  bge t0, s0, backward_pass\n  addi s0, s0, 1 # shrink left bound\n  blt s0, s1, loop_css` },
        bitonic_sort: { name: 'Bitonic Sort (Simplified)', code: `# Simplified bitonic sort for 4 elements\nli x1, 1000\n# stage 1\nlw x2, 0(x1)\nlw x3, 4(x1)\nbge x3, x2, skip1\nsw x3, 0(x1)\nsw x2, 4(x1)\nskip1:\nlw x2, 8(x1)\nlw x3, 12(x1)\nbge x3, x2, skip2\nsw x3, 8(x1)\nsw x2, 12(x1)\nskip2:\n# stage 2\nlw x2, 0(x1)\nlw x3, 8(x1)\nbge x3, x2, skip3\nsw x3, 0(x1)\nsw x2, 8(x1)\nskip3:\nlw x2, 4(x1)\nlw x3, 12(x1)\nbge x3, x2, skip4\nsw x3, 4(x1)\nsw x2, 12(x1)\nskip4:` },
        counting_sort: { name: 'Counting Sort', code: `# Counting Sort for small non-negative integers (range 0-255)\nli s0, 1000 # input array\nli s1, 16   # input size\nli s2, 2000 # count array (size 256 * 4 bytes)\nli s3, 3000 # output array\n# Step 1: Initialize count array to zeros\n# ... loop to zero out s2 ...\n# Step 2: Store count of each element\nli t0, 0\ncount_loop_cs:\n  bge t0, s1, count_accumulate\n  slli t1, t0, 2\n  add t1, s0, t1\n  lw t2, 0(t1) # load value from input\n  slli t3, t2, 2\n  add t3, s2, t3 # address in count array\n  lw t4, 0(t3) # get current count\n  addi t4, t4, 1 # increment\n  sw t4, 0(t3) # store back\n  addi t0, t0, 1\n  j count_loop_cs\ncount_accumulate:\n# Step 3: Modify count array to store actual position\n# ... loop from 1 to 255, count[i] += count[i-1] ...\n# Step 4: Build the output array\n# ... loop through input, place elements in output based on count array ...\n# Step 5: Copy sorted elements back to original array\n# ... memcpy from output to input ...` },
        shell_sort: { name: 'Shell Sort', code: `# Sorts an array using Shell Sort with a simple gap sequence (n/2, n/4, ...)\nli a0, 1000 # array base\nli s0, 16 # array size\n# Start with a large gap, then reduce the gap\nsrli s1, s0, 1 # gap = size / 2\ngap_loop:\n  beq s1, x0, shell_sort_end\n  # Do a gapped insertion sort for this gap size.\n  mv t0, s1 # i = gap\nouter_shell_loop:\n  bge t0, s0, next_gap\n  # add a[i] to the elements that have been gap sorted\n  # save a[i] in temp and make a hole at position i\n  slli t1, t0, 2\n  add t1, a0, t1\n  lw t2, 0(t1) # temp = arr[i]\n  # shift earlier gap-sorted elements up until the correct location for a[i] is found\n  mv t3, t0 # j = i\ninner_shell_loop:\n  sub t4, t3, s1\n  blt t4, x0, insert_element\n  # ... comparison and shift logic ...\n  sub t3, t3, s1\n  j inner_shell_loop\ninsert_element:\n  # ... put temp in its correct location ...\n  addi t0, t0, 1\n  j outer_shell_loop\nnext_gap:\n  srli s1, s1, 1 # gap = gap / 2\n  j gap_loop\nshell_sort_end:` },
        comb_sort: { name: 'Comb Sort', code: `# Sorts an array using Comb Sort\nli a0, 1000 # array base\nli s0, 16 # size\nli s1, s0 # gap = size\nli s2, 1  # swapped = true\ncomb_loop:\n  # Update the gap\n  # gap = max(1, int(gap / 1.3))\n  # ... division and max logic ...\n  beq s2, x0, comb_end # if no swaps in a pass, done\n  li s2, 0 # reset swapped flag\n  # Compare elements with the current gap\n  li t0, 0 # i = 0\ncomb_inner_loop:\n  add t1, t0, s1\n  bge t1, s0, comb_loop # if i+gap is out of bounds, restart main loop\n  # ... comparison and swap logic for arr[i] and arr[i+gap] ...\n  # ... if swap, set s2 = 1 ...\n  addi t0, t0, 1\n  j comb_inner_loop\ncomb_end:` },
        gnome_sort: { name: 'Gnome Sort', code: `# Sorts an array using Gnome Sort\nli a0, 1000 # array base\nli s0, 16 # size\nli t0, 0 # index = 0\ngnome_loop:\n  bge t0, s0, gnome_end\n  beq t0, x0, gnome_inc # if at start, step forward\n  # load arr[index] and arr[index-1]\n  slli t1, t0, 2\n  add t1, a0, t1\n  lw t2, 0(t1)  # current\n  lw t3, -4(t1) # previous\n  bge t2, t3, gnome_inc # if in order, step forward\n  # if out of order, swap and step backward\n  sw t3, 0(t1)\n  sw t2, -4(t1)\n  addi t0, t0, -1\n  j gnome_loop\ngnome_inc:\n  addi t0, t0, 1\n  j gnome_loop\ngnome_end:` },
        pancake_sort: { name: 'Pancake Sort', code: `# Sorts an array using Pancake Sort\nli a0, 1000 # array base\nli s0, 16 # current unsorted size\npancake_loop:\n  li t0, 1\n  ble s0, t0, pancake_end # if size is 1, it's sorted\n  # Find index of max element in arr[0...s0-1]\n  li t1, 0 # max_idx = 0\n  li t2, 1 # i = 1\nfind_max_loop:\n  # ... loop to find index of max element ...\n  j find_max_loop\n  # Flip to move max to front\n  # ... flip(arr, max_idx) ...\n  # Flip to move max to its final place\n  # ... flip(arr, s0-1) ...\n  addi s0, s0, -1\n  j pancake_loop\npancake_end:` },
        odd_even_sort: { name: 'Odd-Even Sort (Brick Sort)', code: `# Sorts an array using Odd-Even Sort\nli a0, 1000 # array base\nli s0, 16 # size\nli s1, 0 # is_sorted = false\noes_loop:\n  beq s1, 1, oes_end\n  li s1, 1 # assume sorted until a swap occurs\n  # Odd phase\n  li t0, 1 # i = 1\nodd_phase:\n  # compare and swap arr[i] and arr[i+1]\n  # ... if swap, set is_sorted = 0 ...\n  addi t0, t0, 2 # i += 2\n  blt t0, s0, odd_phase\n  # Even phase\n  li t0, 0 # i = 0\neven_phase:\n  # compare and swap arr[i] and arr[i+1]\n  # ... if swap, set is_sorted = 0 ...\n  addi t0, t0, 2 # i += 2\n  blt t0, s0, even_phase\n  j oes_loop\noes_end:` },
        cycle_sort: { name: 'Cycle Sort (Conceptual)', code: `# Sorts an array using Cycle Sort, optimal for memory writes\nli a0, 1000 # array base\nli s0, 16 # size\nli t0, 0 # cycle_start = 0\ncycle_sort_loop:\n  # ... main logic for finding cycles and rotating elements ...\n  # This is complex and involves many reads before a write\n  addi t0, t0, 1\n  blt t0, s0, cycle_sort_loop` },
        bucket_sort: { name: 'Bucket Sort (Conceptual)', code: `# Sorts an array using Bucket Sort\n# Assumes input is uniformly distributed\nli s0, 1000 # input array\nli s1, 16   # input size\nli s2, 2000 # array of bucket linked lists\n# Step 1: Create empty buckets\n# ... initialize bucket pointers to null ...\n# Step 2: Scatter elements into buckets\n# ... for each element, calculate bucket index and insert ...\n# Step 3: Sort individual buckets\n# ... for each bucket, run insertion sort ...\n# Step 4: Gather elements from buckets back into original array\n# ... traverse buckets and copy elements back ...` },
        timsort: { name: 'Timsort (Conceptual)', code: `# Hybrid stable sorting algorithm, derived from merge sort and insertion sort\nli s0, 1000 # input array\nli s1, 256 # input size\n# Step 1: Divide array into 'runs' (small, sorted subarrays)\n# ... iterate through array, find/create sorted runs using insertion sort ...\n# Step 2: Merge runs together\n# ... use a stack-based merging pattern to combine runs efficiently ...\n# This minimizes memory movement and exploits existing order.` },
        tournament_sort: { name: 'Tournament Sort (Tree Sort)', code: `# Sorts an array using a binary heap (tournament tree)\nli s0, 1000 # input array\nli s1, 16   # input size\nli s2, 2000 # heap/tree structure\n# Step 1: Build the heap from the input array\n# ... heapify process ...\n# Step 2: Repeatedly extract the minimum element\nli t0, 0\nextract_min_loop:\n  # ... get min (root), place in output array ...\n  # ... replace root with last element, reduce heap size ...\n  # ... bubble down the new root to maintain heap property ...\n  addi t0, t0, 1\n  blt t0, s1, extract_min_loop` },
    },
    "Search": {
        linear_search: { name: 'Linear Search', code: `# Searches for value 42 in an array\nli a0, 1000 # array base\nli a1, 16   # array size\nli a2, 42   # value to find\nli t0, -1   # result index\nli t1, 0    # i = 0\nls_loop:\n  bge t1, a1, ls_end\n  slli t2, t1, 2\n  add t2, a0, t2\n  lw t3, 0(t2)\n  beq t3, a2, ls_found\n  addi t1, t1, 1\n  j ls_loop\nls_found:\n  mv t0, t1\nls_end:`},
        binary_search: { name: 'Binary Search', code: `# Searches for value 42 in a sorted array\nli x1, 1000 # array base\nli x2, 0    # low\nli x3, 6    # high\nli x4, 42   # value to find\nli x10, -1  # result index\nloop:\n  bge x2, x3, not_found\n  add x5, x2, x3\n  srli x5, x5, 1 # mid\n  slli x6, x5, 2\n  add x7, x1, x6\n  lw x8, 0(x7)\n  beq x8, x4, found_bs\n  blt x8, x4, go_right\n  addi x3, x5, -1\n  j loop\ngo_right:\n  addi x2, x5, 1\n  j loop\nfound_bs:\n  mv x10, x5\nnot_found:` },
        jump_search: { name: 'Jump Search', code: `# Jump search for value 42\nli a0, 1000 # array base\nli a1, 16 # size\nli a2, 4 # block size\nli t0, 0 # prev\nli t1, 0 # step\njs_loop1:\n  bge t1, a1, js_loop2 # check bound\n  slli t2, t1, 2\n  add t2, a0, t2\n  lw t3, 0(t2)\n  li t4, 42 # value\n  blt t4, t3, js_loop2\n  mv t0, t1\n  add t1, t1, a2\n  j js_loop1\njs_loop2:\n  # linear search in block\n  # ...\nend_js:`},
        interpolation_search: { name: 'Interpolation Search (Conceptual)', code: `# Interpolation search for a value in a uniformly distributed sorted array\n# This is a conceptual, non-working example for performance modeling\nli a0, 1000 # array base\nli t0, 0 # low index\nli t1, 15 # high index\nli t2, 42 # value to find\nli a1, -1 # result\ninterp_loop:\n  ble t1, t0, interp_end\n  # Load boundary values\n  # ... val_low = arr[low], val_high = arr[high] ...\n  # Calculate probe position: pos = lo + ((val - val_low) * (hi - lo) / (val_high - val_low))\n  # ... complex arithmetic ...\n  # Check arr[pos]\n  # ... update low or high bound ...\n  j interp_loop\ninterp_end:`},
        string_search: { name: 'String Search (strstr)', code: `# Finds substring x2 in string x1\nli x1, 1000 # haystack\nli x2, 2000 # needle\nli x10, -1 # result index\nouter:\n  mv x3, x1\n  mv x4, x2\ninner:\n  lb x5, 0(x4)\n  beq x5, x0, found # needle end\n  lb x6, 0(x3)\n  bne x5, x6, next\n  addi x3, x3, 1\n  addi x4, x4, 1\n  j inner\nnext:\n  addi x1, x1, 1\n  lb x5, 0(x1)\n  bne x5, x0, outer # haystack end\n  j end\nfound:\n  sub x10, x1, x1000\nend:` },
        ternary_search: { name: 'Ternary Search (Recursive)', code: `# Recursive ternary search for a key in a sorted array\nli a0, 1000 # array base\nli a1, 0    # left\nli a2, 15   # right\nli a3, 42   # key\njal ra, ternary_search\nend: j end\nternary_search:\n  # ... recursive implementation logic ...\n  # calculate mid1 and mid2\n  # compare key with arr[mid1] and arr[mid2]\n  # recurse on the appropriate 1/3 segment\n  jr ra`},
        fibonacci_search: { name: 'Fibonacci Search', code: `# Search using Fibonacci numbers\nli a0, 1000 # array base\nli s0, 16 # size\nli a1, 42 # key\n# Find smallest Fibonacci number greater than or equal to n\nli t0, 0 # fibM2\nli t1, 1 # fibM1\nli t2, 1 # fibM\nfib_loop:\n  blt t2, s0, fib_next\n  j fib_search_start\nfib_next:\n  add t3, t1, t0\n  mv t0, t1\n  mv t1, t3\n  mv t2, t3\n  j fib_loop\nfib_search_start:\n  # ... main search logic using fib numbers to narrow range ...` },
        exponential_search: { name: 'Exponential Search', code: `# Exponential search for unbounded arrays\nli a0, 1000 # array base\nli s0, 1024 # array size (for simulation bounds)\nli a1, 42 # key\nli t0, 1 # bound = 1\nexp_loop:\n  # find range for binary search\n  bge t0, s0, exp_bsearch\n  # ... load arr[bound] ...\n  # ... if arr[bound] < key, bound *= 2 ...\n  j exp_loop\nexp_bsearch:\n  # perform binary search in the found range\n  # ... call binary search on arr[bound/2 ... min(bound, n-1)] ...` },
        bfs: { name: 'Graph: Breadth-First Search (BFS)', code: `# BFS on a graph using a queue\nli s0, 2000 # graph adjacency list\nli s1, 3000 # visited array\nli s2, 4000 # queue\nli s3, 0 # queue head\nli s4, 0 # queue tail\n# Add start node 0 to queue\n# ... enqueue logic ...\n# Mark start node as visited\n# ... visited[0] = 1 ...\nbfs_loop:\n  beq s3, s4, bfs_end # if queue is empty, end\n  # Dequeue node u\n  # ... dequeue logic ...\n  # For each neighbor v of u:\n  # ... loop through adjacency list ...\n  # if v is not visited:\n  #   mark as visited\n  #   enqueue v\n  j bfs_loop\nbfs_end:` },
        astar: { name: 'Graph: A* Search (Conceptual)', code: `# A* search algorithm for finding shortest path\nli s0, 2000 # graph data (nodes, edges, weights)\nli s1, 3000 # open set (priority queue)\nli s2, 4000 # closed set (hash set)\nli s3, 0 # start node\nli s4, 15 # goal node\n# Add start node to open set\nastar_loop:\n  # Get node with lowest f_score from open set\n  # If current is goal, reconstruct path and end\n  # Move current from open to closed set\n  # For each neighbor of current:\n  #   Calculate tentative_g_score\n  #   If neighbor is better, update scores and add to open set\n  j astar_loop` },
    },
    "Data Structures": {
        linked_list_traversal: { name: 'Linked List Traversal', code: `# Sums the values in a linked list\nli x1, 1000 # head pointer\nli x5, 0    # sum\nloop:\n  beq x1, x0, end_ll # if ptr is null, end\n  lw x2, 0(x1) # load value\n  add x5, x5, x2 # add to sum\n  lw x1, 4(x1) # load next ptr\n  j loop\nend_ll:` },
        linked_list_insertion: { name: 'Linked List Insertion', code: `# Insert a new node into a linked list\nli a0, 1000 # head\nli a1, 5000 # new node\nli t0, 42 # new value\nsw t0, 0(a1) # new_node->data = 42\nlw t1, 4(a0) # temp = head->next\nsw t1, 4(a1) # new_node->next = temp\nsw a1, 4(a0) # head->next = new_node`},
        tree_traversal: { name: 'Binary Tree Traversal (In-Order)', code: `# Recursive in-order traversal of a binary tree\nli a0, 1000 # root node\nli x5, 0 # sum of values\njal ra, inorder\nend: j end\ninorder:\n  beq a0, x0, inorder_ret\n  addi sp, sp, -8\n  sw ra, 4(sp)\n  sw a0, 0(sp)\n  lw a0, 4(a0) # go left\n  jal ra, inorder\n  lw a0, 0(sp)\n  lw t0, 0(a0) # process node\n  add x5, x5, t0\n  lw a0, 8(a0) # go right\n  jal ra, inorder\ninorder_ret:\n  lw a0, 0(sp)\n  lw ra, 4(sp)\n  addi sp, sp, 8\n  jr ra` },
        hash_table_lookup: { name: 'Hash Table Lookup', code: `# Simple hash table lookup\nli a0, 1000 # table base\nli a1, 89 # key to lookup\nli t0, 16 # table size\nrem t1, a1, t0 # index = key % size\nslli t1, t1, 2\nadd t2, a0, t1\nlw a2, 0(t2) # value = table[index]`},
        queue_operations: { name: 'Queue (Enqueue/Dequeue)', code: `# Simple circular queue operations\nli s0, 1000 # queue array\nli s1, 0 # head\nli s2, 0 # tail\nli s3, 16 # capacity\n# Enqueue 42\nli t0, 42\nslli t1, s2, 2\nadd t1, s0, t1\nsw t0, 0(t1)\naddi s2, s2, 1\nrem s2, s2, s3 # tail = (tail + 1) % cap\n# Dequeue\nslli t1, s1, 2\nadd t1, s0, t1\nlw t2, 0(t1) # value = q[head]\naddi s1, s1, 1\nrem s1, s1, s3 # head = (head + 1) % cap`},
        stack_operations: { name: 'Stack (Push/Pop)', code: `# Simple stack operations\nli sp, 2000 # stack pointer grows down\n# Push 10\nli t0, 10\naddi sp, sp, -4\nsw t0, 0(sp)\n# Push 20\nli t0, 20\naddi sp, sp, -4\nsw t0, 0(sp)\n# Pop to t1\nlw t1, 0(sp)\naddi sp, sp, 4`},
        priority_queue_push: { name: 'Priority Queue Push (Conceptual)', code: `# Pushes a value onto a min-heap based priority queue\n# This is a conceptual, non-working example for performance modeling\nli s0, 1000 # heap array base\nli s1, 7 # current heap size (next free index)\nli a0, 25 # value to insert\n# 1. Insert value at the end of the heap\n# ... store a0 at heap[s1] ...\n# 2. Bubble up to maintain heap property\nli t0, s1 # i = current index\nbubble_up_loop:\n  beq t0, x0, bubble_up_end # stop at root\n  # ... calculate parent index ...\n  # ... load parent and current values ...\n  # ... if current < parent, swap and update i ...\n  j bubble_up_loop\nbubble_up_end:\n  addi s1, s1, 1 # increment heap size` },
        trie_traversal: { name: 'Trie Traversal (Conceptual)', code: `# Traverses a trie to find if a word exists\n# This is a conceptual, non-working example for performance modeling\nli s0, 4000 # trie root node address\nli s1, 5000 # word to search (e.g., address of "CAT")\nli t0, s0 # current node = root\ntrie_loop:\n  lb t1, 0(s1) # get char from word\n  beq t1, x0, trie_check_is_word # end of word\n  # Calculate child index (e.g., 'C' - 'A' = 2)\n  # ... arithmetic to get child_index ...\n  # Load address of next node\n  # ... t0 = current_node->children[child_index] ...\n  beq t0, x0, trie_not_found # no path for this char\n  addi s1, s1, 1 # next char\n  j trie_loop\ntrie_check_is_word:\n  # ... check if current_node->isEndOfWord is true ...\ntrie_not_found:` },
        graph_dfs: { name: 'Graph Traversal (DFS)', code: `# Depth-first search on an adjacency list graph\nli s0, 2000 # adjacency list\nli s1, 3000 # visited array\nli a0, 0    # start node\njal ra, dfs\nend: j end\ndfs:\n  addi sp, sp, -8\n  sw ra, 4(sp)\n  sw a0, 0(sp)\n  # mark as visited\n  slli t0, a0, 2\n  add t1, s1, t0\n  li t2, 1\n  sw t2, 0(t1)\n  # iterate neighbors\n  # ... (simplified logic)\n  lw a0, 0(sp)\n  lw ra, 4(sp)\n  addi sp, sp, 8\n  jr ra` },
        doubly_linked_list: { name: 'Doubly Linked List Ops', code: `# Operations on a doubly linked list\nli s0, 1000 # node\n# Traverse forward\nlw t0, 8(s0) # next_node = node->next\n# Traverse backward\nlw t1, 4(s0) # prev_node = node->prev\n# Insertion\n# ... complex pointer manipulation ...` },
        circular_buffer: { name: 'Circular Buffer (Queue)', code: `# Write and read from a circular buffer\nli s0, 1000 # buffer base\nli s1, 16 # capacity (in words)\nli s2, 0 # write_ptr\nli s3, 0 # read_ptr\n# Write value 42\nli t0, 42\nslli t1, s2, 2\nadd t1, s0, t1\nsw t0, 0(t1)\naddi s2, s2, 1\nrem s2, s2, s1 # wrap pointer\n# Read value\nslli t1, s3, 2\nadd t1, s0, t1\nlw t2, 0(t1)\naddi s3, s3, 1\nrem s3, s3, s1 # wrap pointer` },
        union_find: { name: 'Disjoint Set Union (Union-Find)', code: `# DSU operations with path compression\nli s0, 1000 # parent array\n# find(i) operation\nli a0, 5 # item to find\njal ra, find_set\nfind_set:\n  # ... recursive find with path compression ...\n  jr ra\n# union(i, j) operation\nli a0, 5\nli a1, 6\njal ra, union_sets\nunion_sets:\n  # ... find roots and link by rank/size ...\n  jr ra` },
        bloom_filter: { name: 'Bloom Filter', code: `# Add and check an element in a Bloom filter\nli s0, 1000 # bit array\nli s1, 1024 # size of bit array in bits\nli a0, 12345 # element to add/check\n# Calculate k hash functions\n# hash1 = ...\n# hash2 = ...\n# For adding:\n#   set_bit(s0, hash1 % s1)\n#   set_bit(s0, hash2 % s1)\n# For checking:\n#   check_bit(s0, hash1 % s1)\n#   check_bit(s0, hash2 % s1)` },
        skip_list_search: { name: 'Skip List Search (Conceptual)', code: `# Search for an element in a skip list\nli s0, 1000 # head node of skip list\nli a0, 42 # key to search\nli t0, s0 # current node\n# Start from the highest level of the skip list\n# ... get max level ...\nlevel_loop:\n  # Traverse forward on the current level\n  # ... while current->forward[level]->key < key ...\n  # Drop down to the next level\n  # ... decrement level and continue ...\n  j level_loop\n# Final check at bottom level` },
        segment_tree: { name: 'Segment Tree Query (Conceptual)', code: `# Range sum query on a segment tree\nli s0, 2000 # segment tree array\nli a0, 2 # query range start\nli a1, 7 # query range end\njal ra, query\nquery:\n# ... recursive logic to query sum over [a0, a1] ...\n# if node range is completely within query range, return node value\n# if node range overlaps, recurse on children and sum results\njr ra` },
        fenwick_tree: { name: 'Fenwick Tree (BIT)', code: `# Update and query a Fenwick tree (Binary Indexed Tree)\nli s0, 2000 # BIT array\nli s1, 16 # size\n# Update: add value 5 to index 3\nli a0, 3 # index\nli a1, 5 # value\nupdate_loop:\n  # ... update logic: index += index & -index ...\n  j update_loop\n# Query: get sum up to index 7\nli a0, 7 # index\nli a1, 0 # sum\nquery_loop:\n  # ... query logic: index -= index & -index ...\n  j query_loop` },
        red_black_tree: { name: 'Red-Black Tree Insert (Conceptual)', code: `# Insertion into a Red-Black Tree\n# This is extremely complex due to rebalancing and color flips\nli a0, 42 # value to insert\n# 1. Perform a standard BST insert, color new node RED\n# ... BST insert logic ...\n# 2. Fix violations of R-B properties\n# Case 1: Uncle is RED -> Recolor parent, grandparent, uncle\n# Case 2: Uncle is BLACK (Triangle) -> Rotate parent\n# Case 3: Uncle is BLACK (Line) -> Rotate grandparent, recolor` },
        b_tree: { name: 'B-Tree Lookup (Conceptual)', code: `# Lookup in a B-Tree, common in databases and filesystems\nli s0, 5000 # root node of B-Tree\nli a0, 123 # key to search\nb_tree_search_loop:\n  # Find the first key in current node >= a0\n  # ... linear scan within the node's key array ...\n  # If key is found, return\n  # If not found and is leaf node, search fails\n  # If not found and is internal node, descend to child pointer\n  # ... load child node address and repeat ...\n  j b_tree_search_loop` },
        adj_matrix_traversal: { name: 'Adjacency Matrix Traversal', code: `# Traverses a graph stored as an adjacency matrix\nli s0, 8000 # matrix base address\nli s1, 8 # number of vertices\nli t0, 0 # row (i)\nli t1, 0 # col (j)\n# Iterate through all possible edges (i, j)\nouter_matrix_loop:\n  li t1, 0\ninner_matrix_loop:\n  # Calculate address of matrix[i][j]\n  mul t2, t0, s1\n  add t2, t2, t1\n  add t3, s0, t2 # byte addressed, for word use slli\n  lb t4, 0(t3) # load edge existence\n  # ... do something if edge exists ...\n  addi t1, t1, 1\n  blt t1, s1, inner_matrix_loop\n  addi t0, t0, 1\n  blt t0, s1, outer_matrix_loop` },
    },
    "String & Memory Ops": {
        strlen: { name: 'String Length (strlen)', code: `li x1, 2000 # string base\nli x5, 0    # length counter\nloop:\n  lb x2, 0(x1)\n  beq x2, x0, end_strlen\n  addi x5, x5, 1\n  addi x1, x1, 1\n  j loop\nend_strlen:` },
        strcpy: { name: 'String Copy (strcpy)', code: `li x1, 2000 # source\nli x2, 3000 # destination\nloop:\n  lb x3, 0(x1)\n  sb x3, 0(x2)\n  beq x3, x0, end_strcpy\n  addi x1, x1, 1\n  addi x2, x2, 1\n  j loop\nend_strcpy:` },
        strrev: { name: 'String Reverse (in-place)', code: `# Reverses a null-terminated string in-place\nli a0, 1000 # string start address\n# Find end of string\nli t0, a0 # t0 will be the 'right' pointer\nfind_end_rev:\n  lb t1, 0(t0)\n  beq t1, x0, setup_rev # found null terminator\n  addi t0, t0, 1\n  j find_end_rev\nsetup_rev:\n  addi t0, t0, -1 # point t0 to the last actual character\n# Swap characters from ends moving inwards\nrev_loop:\n  bge a0, t0, rev_end # loop until pointers meet or cross\n  lb t1, 0(a0) # load left char\n  lb t2, 0(t0) # load right char\n  sb t2, 0(a0) # store right char on left side\n  sb t1, 0(t0) # store left char on right side\n  addi a0, a0, 1 # move left pointer right\n  addi t0, t0, -1 # move right pointer left\n  j rev_loop\nrev_end:` },
        memcpy: { name: 'Memory Copy (memcpy)', code: `# Copies N words from src to dst\nli a0, 1000 # src\nli a1, 2000 # dst\nli a2, 16 # num words\nli t0, 0 # i=0\nmemcpy_loop:\n  bge t0, a2, memcpy_end\n  slli t1, t0, 2\n  add t2, a0, t1\n  lw t3, 0(t2)\n  add t4, a1, t1\n  sw t3, 0(t4)\n  addi t0, t0, 1\n  j memcpy_loop\nmemcpy_end:`},
        memmove: { name: 'Memory Move (memmove)', code: `# Copies a block of memory, handling overlapping source and destination\nli a0, 1000 # src address\nli a1, 1004 # dst address (dst > src, overlap)\nli a2, 16 # num bytes to copy\n# Check for overlap and determine copy direction\nblt a1, a0, copy_forward # if dst < src, copy forward\nadd t0, a0, a2\nblt a1, t0, copy_backward # if dst is within src range, copy backward\ncopy_forward:\n  # Standard memcpy from start to end\n  li t1, 0 # counter\nfwd_loop:\n  lb t2, 0(a0)\n  sb t2, 0(a1)\n  addi a0, a0, 1\n  addi a1, a1, 1\n  addi t1, t1, 1\n  blt t1, a2, fwd_loop\n  j memmove_end\ncopy_backward:\n  # Copy from end to start to avoid overwriting data\n  add a0, a0, a2\n  add a1, a1, a2\n  addi a0, a0, -1 # point to last byte\n  addi a1, a1, -1\n  li t1, 0\nbwd_loop:\n  lb t2, 0(a0)\n  sb t2, 0(a1)\n  addi a0, a0, -1\n  addi a1, a1, -1\n  addi t1, t1, 1\n  blt t1, a2, bwd_loop\nmemmove_end:` },
        memset: { name: 'Memory Set (memset)', code: `# Sets N words to a value\nli a0, 1000 # dst\nli a1, 0 # value\nli a2, 32 # num words\nli t0, 0 # i=0\nmemset_loop:\n  bge t0, a2, memset_end\n  slli t1, t0, 2\n  add t2, a0, t1\n  sw a1, 0(t2)\n  addi t0, t0, 1\n  j memset_loop\nmemset_end:`},
        strcmp: { name: 'String Compare (strcmp)', code: `# Compares two strings\nli a0, 1000 # str1\nli a1, 2000 # str2\nli a2, 0 # result\nstrcmp_loop:\n  lb t0, 0(a0)\n  lb t1, 0(a1)\n  bne t0, t1, strcmp_diff\n  beq t0, x0, strcmp_end\n  addi a0, a0, 1\n  addi a1, a1, 1\n  j strcmp_loop\nstrcmp_diff:\n  sub a2, t0, t1\nstrcmp_end:`},
        strcat: { name: 'String Concat (strcat)', code: `# Concatenates str2 onto str1\nli a0, 1000 # str1 (dest)\nli a1, 2000 # str2 (src)\n# find end of str1\nfind_end:\n  lb t0, 0(a0)\n  beq t0, x0, copy_str\n  addi a0, a0, 1\n  j find_end\n# copy str2\ncopy_str:\n  lb t0, 0(a1)\n  sb t0, 0(a0)\n  beq t0, x0, strcat_end\n  addi a0, a0, 1\n  addi a1, a1, 1\n  j copy_str\nstrcat_end:`},
        vector_add: { name: 'Vector Addition', code: `li x1, 1000 # vector A\nli x2, 2000 # vector B\nli x3, 3000 # vector C (result)\nli x4, 16   # vector length\nli x5, 0    # loop counter i\nloop:\n  slli x6, x5, 2 # i * 4\n  add x7, x1, x6\n  add x8, x2, x6\n  lw x9, 0(x7)\n  lw x10, 0(x8)\n  add x11, x9, x10\n  add x12, x3, x6\n  sw x11, 0(x12)\n  addi x5, x5, 1\n  blt x5, x4, loop` },
    },
    "Numeric & Scientific": {
        dot_product: { name: 'Dot Product', code: `# Computes dot product of two vectors\nli a0, 1000 # vec1\nli a1, 2000 # vec2\nli a2, 16   # length\nli a3, 0    # result (sum)\nli t0, 0    # i\ndot_loop:\n  bge t0, a2, dot_end\n  slli t1, t0, 2\n  add t2, a0, t1\n  lw t3, 0(t2)\n  add t4, a1, t1\n  lw t5, 0(t4)\n  mul t6, t3, t5\n  add a3, a3, t6\n  addi t0, t0, 1\n  j dot_loop\ndot_end:` },
        matrix_multiplication: { name: 'Matrix Multiplication (GEMM)', code: `# C = A * B for 4x4 integer matrices\nli s0, 1000 # matrix A base address\nli s1, 2000 # matrix B base address\nli s2, 3000 # matrix C base address\nli s3, 4 # N (dimension)\nli t0, 0 # i (row of C and A)\ni_loop:\n  li t1, 0 # j (col of C and B)\nj_loop:\n  li t2, 0 # k (col of A, row of B)\n  li t3, 0 # accumulator for C[i][j]\nk_loop:\n  # Calculate address of A[i][k]\n  mul t4, t0, s3\n  add t4, t4, t2\n  slli t4, t4, 2\n  add t4, s0, t4\n  lw t4, 0(t4) # load A[i][k]\n  # Calculate address of B[k][j]\n  mul t5, t2, s3\n  add t5, t5, t1\n  slli t5, t5, 2\n  add t5, s1, t5\n  lw t5, 0(t5) # load B[k][j]\n  # Multiply and accumulate\n  mul t6, t4, t5\n  add t3, t3, t6\n  addi t2, t2, 1\n  blt t2, s3, k_loop # next k\n  # Store result in C[i][j]\n  mul t4, t0, s3\n  add t4, t4, t1\n  slli t4, t4, 2\n  add t4, s2, t4\n  sw t3, 0(t4)\n  addi t1, t1, 1\n  blt t1, s3, j_loop # next j\n  addi t0, t0, 1\n  blt t0, s3, i_loop # next i\nend_gemm:`},
        saxpy: { name: 'SAXPY', code: `# SAXPY: Y = a*X + Y (Single-precision A*X Plus Y)\nli s0, 1000 # vector X base\nli s1, 2000 # vector Y base\nli a0, 3 # scalar a\nli s2, 16 # vector length (number of elements)\nli t0, 0 # loop counter i\nsaxpy_loop:\n  bge t0, s2, saxpy_end\n  slli t1, t0, 2 # i * 4 bytes\n  add t2, s0, t1 # address of X[i]\n  add t3, s1, t1 # address of Y[i]\n  lw t4, 0(t2) # load X[i]\n  lw t5, 0(t3) # load Y[i]\n  mul t4, t4, a0 # a * X[i]\n  add t5, t5, t4 # a*X[i] + Y[i]\n  sw t5, 0(t3) # store result back to Y[i]\n  addi t0, t0, 1\n  j saxpy_loop\nsaxpy_end:` },
        matrix_transpose: { name: 'Matrix Transpose', code: `# Transposes a 4x4 matrix\nli s0, 1000 # src matrix\nli s1, 2000 # dst matrix\nli s2, 4    # N\nli t0, 0    # i\nli t1, 0    # j\nmt_i_loop:\n  bge t0, s2, mt_end\n  li t1, 0\nmt_j_loop:\n  bge t1, s2, mt_i_inc\n  # dst[j][i] = src[i][j]\n  # ... address calculation ...\n  addi t1, t1, 1\n  j mt_j_loop\nmt_i_inc:\n  addi t0, t0, 1\n  j mt_i_loop\nmt_end:` },
        fft: { name: 'FFT (Conceptual)', code: `# Conceptual Fast Fourier Transform\nli a0, 1000 # input data\nli a1, 16   # N\n# ... bit reversal permutation ...\n# ... iterative butterfly passes ...\nfft_pass_loop:\n  # ... twiddle factor calculation ...\n  # ... butterfly operation (load, mul, add, sub, store) ...\n  j fft_pass_loop`},
        fir_filter: { name: 'FIR Filter', code: `li x1, 1000 # input signal\nli x2, 2000 # coefficients\nli x3, 3000 # output signal\nli x4, 4    # num_taps\nli x5, 0    # n\nouter_loop:\n  li x6, 0    # k\n  li x10, 0   # acc\ninner_loop:\n  sub x20, x5, x6\n  slli x20, x20, 2\n  add x20, x1, x20\n  lw x11, 0(x20) # input[n-k]\n  slli x21, x6, 2\n  add x21, x2, x21\n  lw x12, 0(x21) # coeff[k]\n  mul x13, x11, x12\n  add x10, x10, x13\n  addi x6, x6, 1\n  blt x6, x4, inner_loop\n  slli x22, x5, 2\n  add x22, x3, x22\n  sw x10, 0(x22) # output[n] = acc\n  addi x5, x5, 1\n  li x30, 8\n  blt x5, x30, outer_loop` },
        convolution: { name: '2D Convolution (Blur)', code: `# Simplified 3x3 blur convolution\nli s0, 1000 # input matrix\nli s1, 2000 # output matrix\nli s2, 4    # width\n# Loop over inner pixels (1 to width-2)\nli s3, 1 # y\ny_loop:\n  li s4, 1 # x\nx_loop:\n  # ... convolution logic ...\n  addi s4, s4, 1\n  li t3, 3\n  blt s4, t3, x_loop\n  addi s3, s3, 1\n  li t3, 3\n  blt s3, t3, y_loop\nend_conv:` },
        dct: { name: 'DCT (Conceptual)', code: `# Simplified 1D Discrete Cosine Transform (DCT-II) for 4 points\n# This is a conceptual, non-working example for performance modeling\nli s0, 1000 # input vector x[n]\nli s1, 2000 # output vector X[k]\nli s2, 3000 # precomputed cosine table\nli t0, 0 # k (frequency index)\nk_loop:\n  li t1, 0 # n (time index)\n  li t2, 0 # accumulator\nn_loop:\n  # Load x[n]\n  # Load cos_table[k][n]\n  # mul and add to accumulator\n  addi t1, t1, 1\n  blt t1, 4, n_loop\n  # Store accumulator to X[k]\n  addi t0, t0, 1\n  blt t0, 4, k_loop` },
        horners_method: { name: 'Polynomial Eval (Horner\'s)', code: `# Evaluates a polynomial using Horner's method\n# P(x) = c0 + c1*x + c2*x^2 + ...\nli s0, 1000 # coefficients array (c_n, c_n-1, ... c0)\nli s1, 4 # degree N=3, so 4 coeffs\nli a0, 2 # x = 2\n# result = c_n\nli t0, s0\nlw t1, 0(t0)\n# loop from n-1 down to 0\nli t2, 1 # i = 1\nhorner_loop:\n  # result = result*x + c_{n-i}\n  mul t1, t1, a0\n  addi t0, t0, 4\n  lw t3, 0(t0)\n  add t1, t1, t3\n  addi t2, t2, 1\n  blt t2, s1, horner_loop` },
        newton_raphson: { name: 'Newton-Raphson Method', code: `# Finds root of a function (e.g., sqrt)\n# Find sqrt of 2, so f(x) = x^2 - 2, f'(x) = 2x\nli a0, 2 # number to find sqrt of\nli t0, 1 # initial guess x0 = 1\nli t1, 10 # iterations\nnewton_loop:\n  # x_n+1 = x_n - f(x_n) / f'(x_n)\n  # x_n+1 = x_n - (x_n^2 - N) / (2*x_n)\n  # ... integer arithmetic for this would be complex ...\n  # ... involves division, which is not a base instruction ...\n  # This is for conceptual workload modeling\n  addi t1, t1, -1\n  bne t1, x0, newton_loop` },
        fast_inv_sqrt: { name: 'Fast Inverse Square Root', code: `# Famous "Fast Inverse Square Root" hack from Quake III\n# This is conceptual as it relies on float/int bit casting\nli a0, 0x5f3759df # magic number\nli a1, 1000 # address of input float\nlw t0, 0(a1) # load float bits as integer\nsrli t1, t0, 1 # logical shift right\nsub t2, a0, t1 # magic number - shifted bits\n# ... two Newton-Raphson iterations would follow ...\n# This workload is mostly bit manipulation and integer arithmetic` },
        jacobi_iteration: { name: 'Jacobi Iteration (Linear Sys)', code: `# Solves a system of linear equations Ax=b using Jacobi method\n# x_i^(k+1) = (1/A_ii) * (b_i - sum_{j!=i} A_ij * x_j^(k))\nli s0, 1000 # matrix A\nli s1, 2000 # vector b\nli s2, 3000 # vector x (current)\nli s3, 4000 # vector x (next)\n# Outer loop for iterations\niter_loop:\n  # Inner loop for each variable x_i\n  var_loop:\n    # ... load b_i ...\n    # ... loop for sum, loading A_ij and x_j ...\n    # ... calculate new x_i and store in s3 ...\n    j var_loop\n  # ... check for convergence, copy s3 to s2 ...\n  j iter_loop` },
        simpsons_rule: { name: 'Numerical Integration (Simpson\'s)', code: `# Approximates integral of a function using Simpson's rule\nli s0, 0 # lower bound a\nli s1, 10 # upper bound b\nli s2, 100 # number of intervals n (must be even)\n# h = (b-a)/n\n# sum = f(a) + f(b)\n# Loop for odd terms: sum += 4 * f(a + i*h)\n# Loop for even terms: sum += 2 * f(a + i*h)\n# result = (h/3) * sum` },
        runge_kutta: { name: 'ODE Solver (RK4)', code: `# Solves an ordinary differential equation using Runge-Kutta 4th order\n# y' = f(t, y), y(t0) = y0\nli t0, 0 # t = t0\nli t1, 100 # y = y0\nli t2, 1 # step size h\nli t3, 10 # number of steps\nrk4_loop:\n  # k1 = h * f(t, y)\n  # k2 = h * f(t + h/2, y + k1/2)\n  # k3 = h * f(t + h/2, y + k2/2)\n  # k4 = h * f(t + h, y + k3)\n  # y = y + (1/6)*(k1 + 2*k2 + 2*k3 + k4)\n  # t = t + h\n  # ... many loads/stores for function evaluation ...\n  addi t3, t3, -1\n  bne t3, x0, rk4_loop` },
        dda_line: { name: 'DDA Line Algorithm', code: `# Draws a line using Digital Differential Analyzer algorithm\nli t0, 1 # x1\nli t1, 1 # y1\nli t2, 8 # x2\nli t3, 5 # y2\n# ... calculate dx, dy, steps, increments ...\n# Loop 'steps' times:\n#   plot(x, y)\n#   x += x_increment\n#   y += y_increment` },
        bresenhams_line: { name: 'Bresenham\'s Line Algorithm', code: `# Draws a line using Bresenham's algorithm (integer only)\nli t0, 1 # x1, y1, ...\n# ... initialization of dx, dy, error term ...\nbresenham_loop:\n  # plot(x, y)\n  # if (error > threshold)\n  #   y = y + y_step\n  #   error = error + error_adjust\n  # x = x + x_step\n  # error = error + error_increment\n  # ... loop until x reaches x2 ...\n  j bresenham_loop` },
        gaussian_elim: { name: 'Gaussian Elimination (Conceptual)', code: `# Solves Ax=b by transforming A into upper triangular form\nli s0, 1000 # augmented matrix [A|b]\nli s1, 4 # size N\n# For each pivot column k from 0 to N-1\npivot_loop:\n  # ... find pivot row (max element in column) and swap ...\n  # For each row i below the pivot row\n  row_loop:\n    # ... calculate factor ...\n    # ... subtract factor * pivot_row from current row ...\n    j row_loop\n  j pivot_loop\n# ... perform back substitution to find x ...` },
        lu_decomposition: { name: 'LU Decomposition (Conceptual)', code: `# Decomposes a matrix A into L (lower triangular) and U (upper triangular)\nli s0, 1000 # matrix A\nli s1, 2000 # matrix L\nli s2, 3000 # matrix U\n# ... Doolittle algorithm implementation ...\n# For each row i:\n#   For each column j:\n#     if j < i: L[i][j] = (1/U[j][j]) * (A[i][j] - sum(...))\n#     else: U[i][j] = A[i][j] - sum(...)\n# This involves many nested loops and memory accesses` },
    },
    "Cryptography": {
        aes_sbox: { name: 'AES S-Box Sub', code: `# AES S-Box substitution on a block of data\nli s0, 1000 # data block\nli s1, 5000 # S-Box table\nli s2, 16 # block size in bytes\nli t0, 0 # i\naes_loop:\n  bge t0, s2, aes_end\n  add t1, s0, t0 # addr of data[i]\n  lb t2, 0(t1) # val = data[i]\n  add t3, s1, t2 # addr of sbox[val]\n  lb t4, 0(t3) # sub_val = sbox[val]\n  sb t4, 0(t1) # data[i] = sub_val\n  addi t0, t0, 1\n  j aes_loop\naes_end:`},
        sha256_round: { name: 'SHA-256 Round (Conceptual)', code: `# One round of SHA-256 compression\n# Load state registers a-h\n# Load message schedule word W[i]\n# Load round constant K[i]\n# ... many bitwise operations (rotr, shr, xor, and) ...\n# ... additions ...\n# Store updated state registers`},
        rsa_mod_exp: { name: 'RSA Modular Exponentiation', code: `# (base^exp) % mod via square-and-multiply\nli t0, 5 # base\nli t1, 117 # exp\nli t2, 19 # mod\nli t3, 1 # result\nmod_exp_loop:\n  beq t1, x0, mod_exp_end\n  # if (exp is odd)\n  andi t4, t1, 1\n  beq t4, x0, exp_even\n  # result = (result * base) % mod\n  mul t3, t3, t0\n  rem t3, t3, t2\nexp_even:\n  # exp = exp >> 1\n  srli t1, t1, 1\n  # base = (base * base) % mod\n  mul t0, t0, t0\n  rem t0, t0, t2\n  j mod_exp_loop\nmod_exp_end:`},
        xor_cipher: { name: 'XOR Cipher', code: `# Simple XOR encryption/decryption\nli a0, 1000 # data\nli a1, 16 # length\nli a2, 0x5A # key\nli t0, 0 # i\nxor_loop:\n  bge t0, a1, xor_end\n  add t1, a0, t0\n  lb t2, 0(t1)\n  xor t2, t2, a2\n  sb t2, 0(t1)\n  addi t0, t0, 1\n  j xor_loop\nxor_end:`},
        crc32: { name: 'CRC32 Checksum', code: `# Computes CRC32 checksum for a block of data using a lookup table\nli s0, 1000 # data block base address\nli s1, 16 # data length in bytes\nli s2, 4000 # CRC32 lookup table base (256 entries * 4 bytes)\nli t0, 0xFFFFFFFF # initialize crc register\ncrc_loop:\n  beq s1, x0, crc_end # end if length is 0\n  lb t1, 0(s0) # load byte of data\n  xor t1, t1, t0 # crc ^ byte\n  andi t1, t1, 0xFF # get lower 8 bits for table index\n  slli t1, t1, 2 # index * 4\n  add t2, s2, t1 # address of table[index]\n  lw t2, 0(t2) # load value from table\n  srli t0, t0, 8 # crc >> 8\n  xor t0, t0, t2 # (crc >> 8) ^ table_value\n  addi s0, s0, 1 # next byte\n  addi s1, s1, -1 # decrement length\n  j crc_loop\ncrc_end:\n  # final XOR with 0xFFFFFFFF\n  li t1, 0xFFFFFFFF\n  xor t0, t0, t1\n  # result is in t0` },
        ecc_add: { name: 'Elliptic Curve Add (Conceptual)', code: `# Conceptual Elliptic Curve point addition (P + Q = R)\n# This is a conceptual, non-working example for performance modeling\n# All operations would be modulo a large prime (p)\n# P = (x1, y1), Q = (x2, y2)\nli x5, 10 # x1\nli x6, 5 # y1\nli x7, 12 # x2\nli x8, 8 # y2\n# Calculate slope s = (y2 - y1) / (x2 - x1)\nsub t0, x8, x6 # y2-y1\nsub t1, x7, x5 # x2-x1\n# ... modular inverse and multiplication for division ...\nmul t2, t0, t1 # s\n# Calculate R = (x3, y3)\n# x3 = s^2 - x1 - x2\nmul t3, t2, t2 # s^2\nsub t3, t3, x5\nsub x9, t3, x7 # x3\n# y3 = s(x1 - x3) - y1\nsub t4, x5, x9 # x1 - x3\nmul t4, t2, t4 # s * (x1 - x3)\nsub x10, t4, x6 # y3\n# Result is R = (x9, x10)` },
        tea: { name: 'Tiny Encryption Algorithm (TEA)', code: `# One round of the TEA block cipher\nli s0, 0 # v0\nli s1, 0 # v1\nli s2, 0 # sum\nli s3, 0x9e3779b9 # delta\nli s4, 123 # k0\nli s5, 456 # k1\n# ... many shifts, xors, and adds ...\n# Example part of the round function:\n# sum += delta\nsll t0, s1, 4\nadd t0, t0, s4\nxor t1, s1, s2\nsrl t2, s1, 5\nadd t2, t2, s5\nxor t1, t1, t2\nadd t0, t0, t1\nxor s0, s0, t0` },
        blowfish_sbox: { name: 'Blowfish S-Box Lookup', code: `# Part of the Blowfish encryption algorithm, heavy on memory lookups\nli s0, 1000 # P-array base\nli s1, 2000 # S-box base\nli t0, 0 # plain_left\nli t1, 0 # plain_right\n# for i = 0 to 15\n#   plain_left = plain_left XOR P[i]\n#   plain_right = F(plain_left) XOR plain_right\n#   swap left and right\n# F(x) involves breaking x into 4 bytes and using them as indices into S-boxes` },
        md5_round: { name: 'MD5 Round (Conceptual)', code: `# One round of MD5, showing the types of operations\nli s0, 0 # A\nli s1, 0 # B\nli s2, 0 # C\nli s3, 0 # D\nli s4, 0 # Message block word M[i]\nli s5, 0 # Round constant T[j]\n# F_func = (B & C) | (~B & D)\nand t0, s1, s2\nnot t1, s1\nand t1, t1, s3\nor t0, t0, t1\n# A = B + ((A + F_func + M[i] + T[j]) <<< s)\nadd t0, s0, t0\nadd t0, t0, s4\nadd t0, t0, s5\n# ... circular left shift ...\nadd s0, s1, t0` },
        diffie_hellman: { name: 'Diffie-Hellman (Conceptual)', code: `# Key exchange algorithm based on modular exponentiation\n# Public parameters: prime p, generator g\n# Alice chooses private key 'a', computes public A = g^a mod p\n# Bob chooses private key 'b', computes public B = g^b mod p\n# Alice computes secret: s = B^a mod p\n# Bob computes secret: s = A^b mod p\n# This workload is dominated by the modular exponentiation benchmark` },
        hmac: { name: 'HMAC (Conceptual)', code: `# Hash-based Message Authentication Code\n# h( (key XOR opad) + h( (key XOR ipad) + message) )\nli s0, 1000 # key\nli s1, 2000 # message\n# 1. Pad key to block size\n# 2. Inner hash\n#   key XOR ipad\n#   append message\n#   run hash function (e.g., SHA-256)\n# 3. Outer hash\n#   key XOR opad\n#   append result of inner hash\n#   run hash function` },
    },
    "Image Processing": {
        grayscale: { name: 'Image: Grayscale Conversion', code: `# Converts an RGB image to grayscale\n# gray = 0.299*R + 0.587*G + 0.114*B\nli s0, 1000 # source RGB image data\nli s1, 2000 # dest grayscale image data\nli s2, 1024 # number of pixels\nli t0, 0 # loop counter i\nimg_gray_loop:\n  # load R, G, B bytes\n  lb t1, 0(s0) # R\n  lb t2, 1(s0) # G\n  lb t3, 2(s0) # B\n  # ... integer-based weighted average calculation ...\n  sb t4, 0(s1) # store gray value\n  addi s0, s0, 3 # next pixel (3 bytes)\n  addi s1, s1, 1 # next pixel (1 byte)\n  addi t0, t0, 1\n  blt t0, s2, img_gray_loop` },
        invert: { name: 'Image: Invert (Negative)', code: `# Inverts the colors of an image (creates a negative)\nli s0, 1000 # image data (source and dest)\nli s1, 1024*3 # number of bytes (RGB)\nli t0, 0 # loop counter\nimg_invert_loop:\n  lb t1, 0(s0) # load color component\n  # value = 255 - value\n  li t2, 255\n  sub t1, t2, t1\n  sb t1, 0(s0) # store inverted value\n  addi s0, s0, 1\n  addi t0, t0, 1\n  blt t0, s1, img_invert_loop` },
        brightness: { name: 'Image: Brightness Adjustment', code: `# Adjusts the brightness of an image\nli s0, 1000 # image data\nli s1, 1024*3 # number of bytes\nli a0, 20 # brightness value (-255 to 255)\nli t0, 0 # loop counter\nimg_bright_loop:\n  lb t1, 0(s0)\n  add t1, t1, a0\n  # Clamp value to 0-255 range\n  # ... clamping logic ...\n  sb t1, 0(s0)\n  addi s0, s0, 1\n  addi t0, t0, 1\n  blt t0, s1, img_bright_loop` },
        contrast: { name: 'Image: Contrast Stretching', code: `# Stretches the contrast of an image\n# val_out = (val_in - min) * 255 / (max - min)\nli s0, 1000 # image data\n# First pass: find min and max pixel values\n# ... loop through image to find min/max ...\n# Second pass: apply contrast formula\n# ... loop through image again ...\n#   load val_in\n#   ... apply formula (requires division) ...\n#   store val_out` },
        sobel_filter: { name: 'Image: Edge Detection (Sobel)', code: `# Applies a Sobel operator for edge detection\nli s0, 1000 # source image\nli s1, 2000 # dest image\nli s2, 32 # image width\n# Loop over inner pixels (x=1..w-2, y=1..h-2)\nsobel_y_loop:\n  sobel_x_loop:\n    # Apply 3x3 Gx and Gy kernels\n    # ... 9 loads for the 3x3 neighborhood ...\n    # ... multiplications and additions for Gx ...\n    # ... multiplications and additions for Gy ...\n    # magnitude = sqrt(Gx^2 + Gy^2) (or |Gx|+|Gy|)\n    # ... store magnitude in dest image ...\n    j sobel_x_loop\n  j sobel_y_loop` },
    },
    "Control Flow & Misc": {
        fibonacci_rec: { name: 'Fibonacci (Recursive)', code: `# Recursive fibonacci\nli a0, 8 # n=8\njal ra, fib\nend_fib: j end_fib\nfib:\n  ble a0, x0, fib_ret_0\n  li t0, 1\n  beq a0, t0, fib_ret_1\n  addi sp, sp, -8\n  sw ra, 4(sp)\n  sw a0, 0(sp)\n  addi a0, a0, -1\n  jal ra, fib\n  lw t1, 0(sp)\n  addi t1, t1, -2\n  sw a0, 0(sp)\n  mv a0, t1\n  jal ra, fib\n  lw t1, 0(sp)\n  add a0, a0, t1\n  lw ra, 4(sp)\n  addi sp, sp, 8\n  jr ra\nfib_ret_0: li a0, 0; jr ra\nfib_ret_1: li a0, 1; jr ra`},
        fibonacci_iter: { name: 'Fibonacci (Iterative)', code: `# Iterative fibonacci for n=12\nli a0, 12 # n\nli t0, 0 # a = 0\nli t1, 1 # b = 1\nli t2, 0 # i = 0\nli t3, 2\nblt a0, t3, fib_iter_end\nfib_iter_loop:\n  bge t2, a0, fib_iter_end\n  add t4, t0, t1\n  mv t0, t1\n  mv t1, t4\n  addi t2, t2, 1\n  j fib_iter_loop\nfib_iter_end:\n  # result in t0`},
        factorial: { name: 'Factorial (Iterative)', code: `# Iterative factorial of n=7\nli a0, 7 # n\nli a1, 1 # result\nfact_loop:\n  beq a0, x0, fact_end\n  mul a1, a1, a0\n  addi a0, a0, -1\n  j fact_loop\nfact_end:`},
        gcd: { name: 'GCD (Euclid\'s Algorithm)', code: `# Finds the Greatest Common Divisor (GCD) of two numbers using Euclid's algorithm\nli a0, 60 # first number\nli a1, 48 # second number\ngcd_loop:\n  beq a1, x0, gcd_end # if b is 0, a is the GCD\n  rem t0, a0, a1 # t0 = a % b\n  mv a0, a1 # a = b\n  mv a1, t0 # b = t0\n  j gcd_loop\ngcd_end:\n# result is in a0` },
        sieve_of_eratosthenes: { name: 'Sieve of Eratosthenes', code: `# Finds prime numbers up to N\nli x1, 1000 # primes array\nli x2, 16   # N\n# Initialize array to 1 (true)\nli x5, 2 # i = 2\ninit_loop:\n  bge x5, x2, sieve_start\n  slli t0, x5, 2\n  add t1, x1, t0\n  li t2, 1\n  sw t2, 0(t1)\n  addi x5, x5, 1\n  j init_loop\nsieve_start:\n  li x5, 2 # p = 2\nouter_sieve:\n  mul t0, x5, x5\n  bge t0, x2, sieve_end\n  slli t1, x5, 2\n  add t2, x1, t1\n  lw t3, 0(t2)\n  beq t3, x0, next_p # if not prime, skip\n  li x6, 0 # i\n  mul x6, x5, x5\ninner_sieve:\n  bge x6, x2, next_p\n  slli t0, x6, 2\n  add t1, x1, t0\n  sw x0, 0(t1) # mark as not prime\n  add x6, x6, x5\n  j inner_sieve\nnext_p:\n  addi x5, x5, 1\n  j outer_sieve\nsieve_end:` },
        checksum: { name: 'Simple Checksum', code: `# Calculates a simple checksum of data\nli x1, 1000 # data start\nli x2, 16   # data length in words\nli x5, 0    # checksum\nli x6, 0    # counter\nloop:\n  lw x3, 0(x1)\n  add x5, x5, x3\n  addi x1, x1, 4\n  addi x6, x6, 1\n  blt x6, x2, loop\nend_checksum:` },
        bit_manipulation: { name: 'Bit Manipulation', code: `# Count set bits in a register (Hamming Weight)\nli a0, 0xDEADBEEF\nli a1, 0 # count\nli t0, 32 # bit index\nbit_count_loop:\n  beq t0, x0, bit_count_end\n  andi t1, a0, 1\n  add a1, a1, t1\n  srli a0, a0, 1\n  addi t0, t0, -1\n  j bit_count_loop\nbit_count_end:` },
        lfsr_rng: { name: 'Random Number (LFSR)', code: `# Generates pseudo-random numbers using a 16-bit Galois LFSR\nli s0, 0xACE1 # initial seed (must be non-zero)\nli t0, 0 # output register\nli t1, 100 # number of iterations to run\nrng_loop:\n  beq t1, x0, rng_end\n  # Get the least significant bit (LSB)\n  andi t2, s0, 1\n  # Right shift the register by 1\n  srli s0, s0, 1\n  # If LSB was 1, XOR the register with the polynomial mask (0xB400)\n  beq t2, x0, no_xor # skip if lsb is 0\n  li t3, 0xB400\n  xor s0, s0, t3\nno_xor:\n  mv t0, s0 # store current state as the random number\n  addi t1, t1, -1 # decrement counter\n  j rng_loop\nrng_end:` },
        kadanes_algorithm: { name: 'Kadane\'s Algorithm (Max Subarray)', code: `# Finds the maximum sum of a contiguous subarray\nli s0, 1000 # array base\nli s1, 8    # array size\nli t0, 0 # max_so_far\nli t1, 0 # current_max\nli t2, 0 # i\nkadane_loop:\n  # current_max = current_max + arr[i]\n  slli t3, t2, 2\n  add t3, s0, t3\n  lw t4, 0(t3)\n  add t1, t1, t4\n  # if current_max < 0, current_max = 0\n  blt t1, x0, reset_current\n  # if max_so_far < current_max, max_so_far = current_max\n  blt t0, t1, update_max\n  j next_kadane\nreset_current: li t1, 0; j update_max\nupdate_max: mv t0, t1\nnext_kadane:\n  addi t2, t2, 1\n  blt t2, s1, kadane_loop` },
        tower_of_hanoi: { name: 'Tower of Hanoi (Recursive)', code: `# Solves the Tower of Hanoi puzzle recursively\nli a0, 3 # number of disks\nli a1, 1 # source peg\nli a2, 3 # destination peg\nli a3, 2 # auxiliary peg\njal ra, hanoi\nend: j end\nhanoi:\n  # ... recursive logic ...\n  # if n == 1, move disk from src to dst\n  # else:\n  #   hanoi(n-1, src, aux, dst)\n  #   move disk from src to dst\n  #   hanoi(n-1, aux, dst, src)\n  jr ra` },
        knapsack: { name: 'Knapsack DP (Conceptual)', code: `# 0/1 Knapsack problem using dynamic programming\nli s0, 1000 # weights array\nli s1, 2000 # values array\nli s2, 50   # knapsack capacity\nli s3, 4    # number of items\nli s4, 3000 # DP table\n# ... nested loops to fill the DP table ...\n# for i from 0 to n:\n#   for w from 0 to capacity:\n#     if weights[i-1] <= w:\n#       table[i][w] = max(vals[i-1] + table[i-1][w-weights[i-1]], table[i-1][w])\n#     else:\n#       table[i][w] = table[i-1][w]` },
        lcs: { name: 'Longest Common Subsequence (DP)', code: `# Finds the length of the longest common subsequence of two strings\nli s0, 1000 # string 1\nli s1, 2000 # string 2\nli s2, 3000 # DP table\n# ... nested loops to fill DP table ...\n# for i from 0 to len(str1):\n#   for j from 0 to len(str2):\n#     if str1[i-1] == str2[j-1]:\n#       table[i][j] = 1 + table[i-1][j-1]\n#     else:\n#       table[i][j] = max(table[i-1][j], table[i][j-1])` },
        dijkstra: { name: 'Dijkstra\'s Algorithm (Conceptual)', code: `# Finds shortest paths from a source node to all other nodes\nli s0, 2000 # graph (adjacency list with weights)\nli s1, 3000 # distances array (initialized to infinity)\nli s2, 4000 # priority queue of nodes to visit\n# ... initialization ...\n# distances[source] = 0\n# add source to priority queue\ndijkstra_loop:\n  # while PQ is not empty:\n  #   u = extract_min from PQ\n  #   for each neighbor v of u:\n  #     alt = distances[u] + weight(u, v)\n  #     if alt < distances[v]:\n  #       distances[v] = alt\n  #       update v in PQ\n  j dijkstra_loop` },
        graph_bfs_traversal: { name: 'Graph: Breadth-First Search', code: `# BFS on a graph using a queue\nli s0, 2000 # graph adjacency list\nli s1, 3000 # visited array\nli s2, 4000 # queue\nli s3, 0 # queue head\nli s4, 0 # queue tail\n# Add start node 0 to queue\n# ... enqueue logic ...\n# Mark start node as visited\n# ... visited[0] = 1 ...\nbfs_loop:\n  beq s3, s4, bfs_end # if queue is empty, end\n  # Dequeue node u\n  # ... dequeue logic ...\n  # For each neighbor v of u:\n  # ... loop through adjacency list ...\n  # if v is not visited:\n  #   mark as visited\n  #   enqueue v\n  j bfs_loop\nbfs_end:` },
        graph_dfs_traversal: { name: 'Graph: Depth-First Search', code: `# Depth-first search on an adjacency list graph\nli s0, 2000 # adjacency list\nli s1, 3000 # visited array\nli a0, 0    # start node\njal ra, dfs\nend: j end\ndfs:\n  addi sp, sp, -8\n  sw ra, 4(sp)\n  sw a0, 0(sp)\n  # mark as visited\n  slli t0, a0, 2\n  add t1, s1, t0\n  li t2, 1\n  sw t2, 0(t1)\n  # iterate neighbors\n  # ... (simplified logic)\n  lw a0, 0(sp)\n  lw ra, 4(sp)\n  addi sp, sp, 8\n  jr ra` },
    },
};

const Simulator: React.FC<SimulatorProps> = ({ config2D, config3D, onSimulationComplete, theme }) => {
    const [code, setCode] = useState('');
    const [selectedBenchmark, setSelectedBenchmark] = useState('Sorting:bubble_sort');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [memoryPattern, setMemoryPattern] = useState<MemoryAccessPattern>('random');
    const [instructionMix, setInstructionMix] = useState(50); // % of memory ops

    const addLog = useCallback((message: string, type: LogType) => {
        setLogs(prev => [...prev, { message, type }]);
    }, []);
    
    const handleBenchmarkLoad = useCallback((key: string) => {
        const [category, benchmarkKey] = key.split(':');
        if (category && benchmarkKey && BENCHMARK_EXAMPLES[category]?.[benchmarkKey]) {
            const benchmark = BENCHMARK_EXAMPLES[category][benchmarkKey];
            setCode(benchmark.code);
            addLog(`Loaded benchmark: "${benchmark.name}"`, 'info');
            setSelectedBenchmark(key);
        }
    }, [addLog]);

    useEffect(() => {
        handleBenchmarkLoad(selectedBenchmark);
        addLog("Simulator ready. Load a benchmark or write your own code.", 'special');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on initial mount

    const runSimulation = (config: SystemConfig, name: '2D Baseline' | '3D Stacked'): { metrics: BenchmarkMetrics, registers: RegisterFile } => {
        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        const registers: RegisterFile = Array.from({ length: 32 }, (_, i) => `x${i}`).reduce((acc, reg) => ({ ...acc, [reg]: 0 }), {});
        
        let totalCycles = 0;
        let memAccesses = 0;
        let nonMemOps = 0;
        let pc = 0;
        const maxInstructions = 10000;
        let executedInstructions = 0;
        
        while (pc < lines.length && executedInstructions < maxInstructions) {
            const line = lines[pc];
            pc++;
            executedInstructions++;
            
            const isMemOp = line.includes('lw') || line.includes('sw');
            
            if (isMemOp) memAccesses++; else nonMemOps++;

            totalCycles += 1; // Base CPI of 1
        }
        
        // --- Cache & AMAT Calculation ---
        const calcAMAT = (c: typeof config.cache): { amat: number, cacheMetrics: BenchmarkMetrics['cache'] } => {
            const getMissRate = (level: keyof typeof c, size: number) => {
                const baseMiss = 1 / (size / 4); 
                if (memoryPattern === 'sequential') return baseMiss * 0.1;
                if (memoryPattern === 'strided') return baseMiss * 0.5;
                return baseMiss; 
            };
            
            const l1MissRate = c.l1.enabled ? getMissRate('l1', c.l1.size) : 1;
            const l2MissRate = c.l2.enabled ? getMissRate('l2', c.l2.size) : 1;
            const l3MissRate = c.l3.enabled ? getMissRate('l3', c.l3.size) : 1;

            let l3Penalty = config.mainMemory.latency;
            let l3AMAT = c.l3.enabled ? c.l3.latency + l3MissRate * l3Penalty : l3Penalty;

            let l2Penalty = l3AMAT + (name === '3D Stacked' ? config.tsv.latency : 0);
            let l2AMAT = c.l2.enabled ? c.l2.latency + l2MissRate * l2Penalty : l2Penalty;

            let l1Penalty = l2AMAT + (name === '3D Stacked' ? config.tsv.latency : 0);
            let amat = c.l1.enabled ? c.l1.latency + l1MissRate * l1Penalty : l1Penalty;
            
            const cacheMetrics: BenchmarkMetrics['cache'] = {
                l1: { hitRate: 1 - l1MissRate, missRate: l1MissRate },
                l2: { hitRate: 1 - l2MissRate, missRate: l2MissRate },
                l3: { hitRate: 1 - l3MissRate, missRate: l3MissRate },
            };

            return { amat, cacheMetrics };
        };

        const { amat, cacheMetrics } = calcAMAT(config.cache);
        const memOpsRatio = instructionMix / 100;
        const totalInstructions = memAccesses + nonMemOps;
        const estimatedMemOps = totalInstructions * memOpsRatio;
        
        totalCycles = (totalInstructions * (1 - memOpsRatio)) + (estimatedMemOps * amat);
        const ipc = totalInstructions / totalCycles;

        // --- Corrected Thermoelectric & Power Calculation ---
        const E_MEM_2D = 500, E_MEM_3D = 50; // pJ
        const E_NON_MEM = 10; // pJ
        const energyPerMemOp = name === '2D Baseline' ? E_MEM_2D : E_MEM_3D;
        const avgEnergyPerInst = (energyPerMemOp * memOpsRatio + E_NON_MEM * (1 - memOpsRatio)) * 1e-12; // Joules
        const CLOCK_FREQ = 2e9; // 2 GHz
        const dynamicPower = avgEnergyPerInst * (ipc * CLOCK_FREQ); // E * I/C * C/S = E/S (Watts)

        // New model to break the thermal runaway feedback loop.
        // 1. Estimate temperature based ONLY on dynamic power.
        const tempFromDynamic = config.thermal.ambientTemp + (dynamicPower * config.thermal.thermalResistance);
        
        // 2. Calculate static power based on that dynamic-only temperature.
        const P_LEAKAGE_BASE = 0.5; // Watts
        const staticPower = P_LEAKAGE_BASE * Math.pow(1.08, (tempFromDynamic - config.thermal.ambientTemp) / 10);
        
        // 3. Calculate final total power and operating temperature.
        const totalPower = dynamicPower + staticPower;
        const operatingTemp = config.thermal.ambientTemp + (totalPower * config.thermal.thermalResistance);

        let throttlingPercent = 0;
        if (operatingTemp > config.thermal.tdpLimit) {
            throttlingPercent = Math.min(50, (operatingTemp - config.thermal.tdpLimit) * 2);
            totalCycles *= (1 + throttlingPercent / 100);
        }

        // --- Create a random register file state for display ---
        for (let i = 1; i < 32; i++) {
             registers[`x${i}`] = Math.floor(Math.random() * 1000);
        }

        return {
            metrics: {
                totalCycles,
                amat,
                ipc: totalInstructions / totalCycles, // Recalculate IPC with throttled cycles
                power: { dynamic: dynamicPower, static: staticPower, total: totalPower },
                operatingTemp,
                throttlingPercent,
                cache: cacheMetrics,
            },
            registers
        };
    };

    const handleRunSimulation = () => {
        setIsLoading(true);
        setLogs([]);
        addLog('Starting simulation...', 'special');

        setTimeout(() => {
            try {
                addLog('Simulating 2D Baseline system...', 'info');
                const { metrics: result2D, registers } = runSimulation(config2D, '2D Baseline');
                addLog('2D Baseline simulation complete.', 'success');

                addLog('Simulating 3D Stacked system...', 'info');
                const { metrics: result3D } = runSimulation(config3D, '3D Stacked');
                addLog('3D Stacked simulation complete.', 'success');
                
                const improvement = ((result2D.totalCycles - result3D.totalCycles) / result2D.totalCycles) * 100;

                const finalResult: BenchmarkResult = {
                    '2D Baseline': result2D,
                    '3D Stacked': result3D,
                    improvement,
                };

                addLog('All simulations finished. Redirecting to analysis page...', 'special');
                onSimulationComplete(finalResult, registers);

            } catch (error) {
                console.error(error);
                if (error instanceof Error) {
                    addLog(`Simulation failed: ${error.message}`, 'error');
                } else {
                    addLog('An unknown simulation error occurred.', 'error');
                }
            } finally {
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <div className="space-y-8">
            {/* Benchmark Workload Section */}
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-cyan-500/10 p-2 rounded-md"><CodeBracketIcon className="w-6 h-6 text-cyan-500" /></div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Benchmark Workload</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <label htmlFor="benchmark-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Load a benchmark example
                        </label>
                        <select
                            id="benchmark-select"
                            value={selectedBenchmark}
                            onChange={e => handleBenchmarkLoad(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md text-slate-900 dark:text-slate-200"
                        >
                            {Object.entries(BENCHMARK_EXAMPLES).map(([category, benchmarks]) => (
                                <optgroup key={category} label={category}>
                                    {Object.entries(benchmarks).map(([key, { name }]) => (
                                        <option key={`${category}:${key}`} value={`${category}:${key}`}>{name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Memory Access Pattern
                        </label>
                         <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-slate-200 dark:bg-slate-900/50 p-1">
                            {(['sequential', 'random', 'strided'] as MemoryAccessPattern[]).map(pattern => (
                                <button key={pattern} onClick={() => setMemoryPattern(pattern)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 capitalize ${memoryPattern === pattern ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                                    {pattern}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <label htmlFor="instruction-mix" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        <span className="flex items-center">
                            Instruction Mix (% Memory Ops): <strong className="ml-2 text-slate-800 dark:text-slate-100">{instructionMix}%</strong>
                             <div className="relative group ml-1.5 flex items-center">
                                <InformationCircleIcon className="w-4 h-4 text-slate-500" />
                                <div className="absolute bottom-full mb-2 w-64 p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 -translate-x-1/2 left-1/2">
                                    Adjusts the ratio of memory-access instructions (lw, sw) to computational instructions to simulate different workload types (e.g., memory-bound vs. compute-bound).
                                </div>
                            </div>
                        </span>
                    </label>
                    <input
                        id="instruction-mix"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={instructionMix}
                        onChange={e => setInstructionMix(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                </div>
                
                <div className="mt-4">
                     <label htmlFor="code-editor" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Or write your own RISC-V code:
                    </label>
                    <CodeEditor id="code-editor" value={code} onChange={e => setCode(e.target.value)} rows={10} placeholder="Enter RISC-V assembly code here..." />
                </div>
                 <div className="mt-6 flex justify-end">
                    <button onClick={handleRunSimulation} disabled={isLoading} className="flex items-center space-x-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200 disabled:bg-slate-500 disabled:cursor-wait">
                        <PlayIcon className="w-4 h-4" />
                        <span>{isLoading ? 'Simulating...' : 'Run Simulation'}</span>
                    </button>
                </div>
            </div>

            <SystemVisualizer results={null} isVisualizing={isLoading} theme={theme} />

            {/* Simulation Log Section */}
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Simulation Log</h3>
                <div className="h-48 overflow-y-auto bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md font-mono text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                   {logs.map((log, i) => {
                        let Icon = InformationCircleIcon;
                        let iconColor = 'text-slate-500';
                        if(log.type === 'success') { Icon = CheckCircleIcon; iconColor = 'text-green-500'; }
                        if(log.type === 'error') { Icon = ExclamationTriangleIcon; iconColor = 'text-red-500'; }
                        if(log.type === 'special') { Icon = PlayIcon; iconColor = 'text-cyan-500'; }

                        return (
                             <div key={i} className={`flex items-start space-x-2`}>
                                <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                                <span className="text-slate-700 dark:text-slate-300">{log.message}</span>
                            </div>
                        )
                   })}
                </div>
            </div>
        </div>
    );
};

export default Simulator;
