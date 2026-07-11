package com.openai.chat2006.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin // Enable quick cross-origin support
@RequiredArgsConstructor
public class MaintenanceController {

    private final com.openai.chat2006.service.LocalDataService localDataService;
    private final Map<UUID, DefragTask> activeTasks = new ConcurrentHashMap<>();
    private static final int GRID_SIZE = 120; // Represents a grid of 120 clusters

    @Data
    private static class DefragTask {
        private UUID id;
        private String type;
        private long startTime;
        private long durationMs;
        private int seed;

        public DefragTask(String type, long durationMs) {
            this.id = UUID.randomUUID();
            this.type = type;
            this.startTime = System.currentTimeMillis();
            this.durationMs = durationMs;
            this.seed = new Random().nextInt(1000);
        }

        public int getProgress() {
            long elapsed = System.currentTimeMillis() - startTime;
            if (elapsed >= durationMs) {
                return 100;
            }
            return (int) ((elapsed * 100) / durationMs);
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startDefrag(@RequestParam(defaultValue = "optimize_cache") String type) {
        long duration = 12000; // 12 seconds simulation
        if ("repair_db".equals(type)) duration = 18000;
        else if ("rebuild_dict".equals(type)) duration = 10000;
        else if ("clean_temp".equals(type)) duration = 6000;
        else if ("repair_index".equals(type)) duration = 14000;

        DefragTask task = new DefragTask(type, duration);
        activeTasks.put(task.getId(), task);
        localDataService.writeLog("MAINTENANCE", "Started local DB defragmentation: " + type.toUpperCase().replace("_", " "));

        return ResponseEntity.ok(Map.of(
                "taskId", task.getId(),
                "type", task.getType(),
                "durationMs", task.getDurationMs(),
                "message", "Defragmentation started: " + type.toUpperCase().replace("_", " ")
        ));
    }

    @GetMapping("/status/{taskId}")
    public ResponseEntity<?> getDefragStatus(@PathVariable UUID taskId) {
        DefragTask task = activeTasks.get(taskId);
        if (task == null) {
            return ResponseEntity.notFound().build();
        }

        int progress = task.getProgress();
        String[] clusters = generateClusterMap(progress, task.getSeed());

        boolean done = progress >= 100;
        if (done) {
            activeTasks.remove(taskId);
            localDataService.writeLog("MAINTENANCE", "Completed local DB defragmentation: " + task.getType().toUpperCase().replace("_", " ") + ". Sectors consolidated.");
        }

        return ResponseEntity.ok(Map.of(
                "taskId", task.getId(),
                "type", task.getType(),
                "progress", progress,
                "completed", done,
                "clusters", clusters,
                "message", done ? "Task completed successfully!" : "Analyzing and defragmenting clusters..."
        ));
    }

    private String[] generateClusterMap(int progress, int seed) {
        String[] map = new String[GRID_SIZE];
        Random rand = new Random(seed);

        // Grid states:
        // U: Optimized/Unfragmented (Blue)
        // F: Fragmented (Red)
        // P: Processing (Green)
        // E: Free space (White)
        // S: System/Unmovable (Greenish-Blue or Grey)

        for (int i = 0; i < GRID_SIZE; i++) {
            // Allocate system files (unmovable)
            if (i % 15 == 0) {
                map[i] = "S";
                continue;
            }

            double roll = rand.nextDouble();
            if (roll < 0.25) {
                map[i] = "E"; // Empty block
            } else if (roll < 0.60) {
                map[i] = "U"; // Pre-optimized block
            } else {
                map[i] = "F"; // Fragmented block
            }
        }

        // Apply progress: Turn fragmented Red blocks into Optimized Blue blocks
        int itemsToOptimize = (GRID_SIZE * progress) / 100;
        int activeWrites = 0;

        for (int i = 0; i < GRID_SIZE; i++) {
            if ("S".equals(map[i]) || "E".equals(map[i])) {
                continue;
            }

            if ("F".equals(map[i])) {
                // If this block is within the optimized cursor range, turn it Blue
                if (i < itemsToOptimize) {
                    map[i] = "U";
                } else if (i < itemsToOptimize + 8 && activeWrites < 4 && progress < 100) {
                    // Turn currently defragmenting blocks to green (Processing) or yellow (Writing)
                    map[i] = (activeWrites++ % 2 == 0) ? "P" : "W";
                }
            }
        }

        // Edge case: if completed, ensure no Fragmented remains
        if (progress >= 100) {
            for (int i = 0; i < GRID_SIZE; i++) {
                if ("F".equals(map[i]) || "P".equals(map[i]) || "W".equals(map[i])) {
                    map[i] = "U";
                }
            }
        }

        return map;
    }
}
