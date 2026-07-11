package com.openai.chat2006.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/benchmark")
@CrossOrigin
@RequiredArgsConstructor
public class BenchmarkController {

    private final com.openai.chat2006.service.LocalDataService localDataService;

    @GetMapping("/diagnostics")
    public ResponseEntity<?> getDiagnostics() {
        Map<String, Object> diag = new HashMap<>();
        diag.put("osName", "Microsoft Windows XP Professional SP2");
        diag.put("cpuName", "Intel(R) Pentium(R) 4 CPU 3.20GHz (2 CPUs)");
        diag.put("ramTotal", "1024 MB RAM DDR2");
        diag.put("diskHealth", "Optimal (Seagate SATA 160GB)");
        diag.put("directxVersion", "DirectX 9.0c (4.09.0000.0904)");
        diag.put("dictionaryWordCount", 248102);
        diag.put("grammarCacheHitRatio", "91.4%");
        diag.put("registryIntegrity", "Secure / Checked");
        diag.put("openaiConnectionServer", "NY-Data-Center-Server-17");
        diag.put("systemTempFolderClean", true);
        localDataService.writeLog("DIAG", "Diagnostic check performed: Pentium 4 CPU, DDR2, DirectX 9.0c active.");
        return ResponseEntity.ok(diag);
    }

    @PostMapping("/run")
    public ResponseEntity<?> runBenchmark() {
        // Simulate benchmark taking 2 seconds
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        Random rand = new Random();
        int baseScore = 6500;
        int randomBonus = rand.nextInt(1500);
        int finalScore = baseScore + randomBonus;

        double responseTimeSec = 0.8 + (rand.nextDouble() * 1.4);
        double accuracy = 91.2 + (rand.nextDouble() * 7.5);
        double grammarQuality = 95.0 + (rand.nextDouble() * 4.8);

        Map<String, Object> results = new HashMap<>();
        results.put("cpuPerformance", "Pentium 4 3.2GHz: Stable (124 GFLOPS)");
        results.put("ramThroughput", "DDR2 Dual Channel: 4200 MB/s");
        results.put("diskReadSpeed", "74.2 MB/s");
        results.put("networkLatencyRating", "Acceptable (142ms average)");
        results.put("averageResponseTime", String.format("%.2fs", responseTimeSec));
        results.put("languageAccuracy", String.format("%.1f%%", accuracy));
        results.put("grammarQuality", String.format("%.1f%%", grammarQuality));
        results.put("benchmarkScore", finalScore + " Points");
        results.put("ratingClass", getScoreRating(finalScore));
        localDataService.writeLog("DIAG", "Benchmark run completed. Final Score: " + finalScore + " Points. Rating: " + getScoreRating(finalScore));

        return ResponseEntity.ok(results);
    }

    private String getScoreRating(int score) {
        if (score > 7500) return "Class A (Outstanding Performance)";
        if (score > 7000) return "Class B (High-Performance Enterprise)";
        return "Class C (Standard Workstation)";
    }
}
