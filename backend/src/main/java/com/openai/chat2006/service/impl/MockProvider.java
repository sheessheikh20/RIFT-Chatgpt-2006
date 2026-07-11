package com.openai.chat2006.service.impl;

import com.openai.chat2006.exception.KnowledgePackMissingException;
import com.openai.chat2006.model.KnowledgePack;
import com.openai.chat2006.model.Message;
import com.openai.chat2006.repository.KnowledgePackRepository;
import com.openai.chat2006.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("mockProvider")
@RequiredArgsConstructor
public class MockProvider implements AIService {

    private final KnowledgePackRepository knowledgePackRepository;

    @Override
    public String generateResponse(String prompt, String profile, List<Message> history) {
        String category = classifyPrompt(prompt);
        verifyKnowledgePack(category);

        return buildMockResponse(prompt, profile, category);
    }

    private String classifyPrompt(String prompt) {
        String p = prompt.toLowerCase();
        if (p.contains("medical") || p.contains("doctor") || p.contains("disease") || p.contains("cancer") || p.contains("health") || p.contains("symptom") || p.contains("anatomy") || p.contains("virus") || p.contains("medicine")) {
            return "medicine";
        }
        if (p.contains("stock") || p.contains("finance") || p.contains("money") || p.contains("invest") || p.contains("market") || p.contains("revenue") || p.contains("interest rate") || p.contains("economics") || p.contains("bank") || p.contains("budget")) {
            return "finance";
        }
        if (p.contains("astronomy") || p.contains("planet") || p.contains("star") || p.contains("galaxy") || p.contains("space") || p.contains("black hole") || p.contains("mars") || p.contains("moon") || p.contains("gravity") || p.contains("telescope")) {
            return "astronomy";
        }
        if (p.contains("engineering") || p.contains("bridge") || p.contains("construct") || p.contains("machine") || p.contains("engine") || p.contains("mechanical") || p.contains("civil") || p.contains("circuit") || p.contains("thermodynamic")) {
            return "engineering";
        }
        if (p.contains("legal") || p.contains("law") || p.contains("court") || p.contains("attorney") || p.contains("contract") || p.contains("sue") || p.contains("patent") || p.contains("copyright") || p.contains("trademark")) {
            return "legal";
        }
        if (p.contains("code") || p.contains("program") || p.contains("java") || p.contains("python") || p.contains("sql") || p.contains("developer") || p.contains("compile") || p.contains("bug") || p.contains("loop") || p.contains("c++") || p.contains("html") || p.contains("css")) {
            return "programming";
        }
        if (p.contains("math") || p.contains("calculate") || p.contains("algebra") || p.contains("calculus") || p.contains("geometry") || p.contains("matrix") || p.contains("equation") || p.contains("plus") || p.contains("integral") || p.contains("fraction")) {
            return "mathematics";
        }
        if (p.contains("history") || p.contains("war") || p.contains("king") || p.contains("ancient") || p.contains("president") || p.contains("century") || p.contains("empire") || p.contains("roman") || p.contains("revolution")) {
            return "history";
        }
        if (p.contains("define") || p.contains("meaning") || p.contains("dictionary") || p.contains("synonym") || p.contains("word")) {
            return "dictionary";
        }
        return "grammar"; // Fallback to Grammar Engine
    }

    private void verifyKnowledgePack(String category) {
        KnowledgePack pack = knowledgePackRepository.findById(category).orElse(null);
        if (pack != null && !pack.isInstalled()) {
            throw new KnowledgePackMissingException(
                    pack.getId(),
                    pack.getName(),
                    pack.getSizeMb(),
                    pack.getEstimatedDownloadMinutes()
            );
        }
    }

    private String buildMockResponse(String prompt, String profile, String category) {
        String profileName = profile != null ? profile : "Default Assistant";
        StringBuilder sb = new StringBuilder();

        // 1. Prefix by Profile
        switch (profileName) {
            case "Teacher":
                sb.append("[Teacher Mode Activated]\nHello! Let's learn something new today. Keep your notebook ready!\n\n");
                break;
            case "Scientist":
                sb.append("[Scientist Mode Activated]\nHypothesis formulated. Loading technical descriptors and reference data...\n\n");
                break;
            case "Business Consultant":
                sb.append("[Business Consultant Mode Activated]\nKey takeaways & strategic deliverables mapped. Let's align on the objectives:\n\n");
                break;
            case "Creative Writer":
                sb.append("[Creative Writer Mode Activated]\nThrough the mist of letters and ink, the words gather like storm clouds...\n\n");
                break;
            case "Programmer":
                sb.append("[Programmer Mode Activated]\n// Initializing code execution sequence\n// Compiler Target: Java 1.5 (2006 Baseline)\n\n");
                break;
            case "Historian":
                sb.append("[Historian Mode Activated]\nLet us consult the scrolls of history and review the historical record:\n\n");
                break;
            default:
                sb.append("[Standard Prompt Agent]\n");
        }

        // 2. Body based on category
        switch (category) {
            case "programming":
                sb.append("To accomplish this, here is a compliant Java 5 code block utilizing Generics (new in 2004!):\n\n");
                sb.append("```java\n");
                sb.append("import java.util.List;\n");
                sb.append("import java.util.ArrayList;\n\n");
                sb.append("public class ChatApp2006 {\n");
                sb.append("    // Standard main entry point\n");
                sb.append("    public static void main(String[] args) {\n");
                sb.append("        List<String> list = new ArrayList<String>();\n");
                sb.append("        list.add(\"ChatGPT 2006 Engine Running\");\n");
                sb.append("        for (String msg : list) {\n");
                sb.append("            System.out.println(msg);\n");
                sb.append("        } // End loop\n");
                sb.append("    }\n");
                sb.append("}\n");
                sb.append("```\n");
                sb.append("\n*Remember to verify your classpath before building this class.*");
                break;
            case "mathematics":
                sb.append("Analyzing numerical query: \"").append(prompt).append("\"\n\n");
                sb.append("By applying the quadratic formula:\n");
                sb.append("   x = [-b \u00b1 \u221a(b\u00b2 - 4ac)] / 2a\n\n");
                sb.append("We calculate the derivatives accordingly. The result converges to 42.");
                break;
            case "history":
                sb.append("In the year 1804, Napoleon Bonaparte was crowned Emperor of the French at Notre-Dame Cathedral in Paris. This marked the height of the First French Empire, disrupting the European balance of power established after the Treaty of Westphalia. These events eventually triggered the Congress of Vienna in 1815.");
                break;
            case "dictionary":
                sb.append("Word Definition Query: \n");
                sb.append("  - Entry: \"Intelligent Conversation Engine\"\n");
                sb.append("  - Part of Speech: Noun Phrase\n");
                sb.append("  - Definition: A state-of-the-art enterprise software utility released by OpenAI Corporation in 2006 to generate syntactically correct text approximations on a desktop terminal.");
                break;
            case "medicine":
                sb.append("Medical Data Summary (Medicine Pack 1.0):\n");
                sb.append("Clinical trials demonstrate that maintaining regular cardiovascular exercise (150 minutes per week) significantly reduces the incidence of coronary artery disease. Ensure diagnostic checks occur annually.");
                break;
            case "finance":
                sb.append("Financial Report (Finance Pack 1.0):\n");
                sb.append("Analyzing market indicators. The yield curve has inverted, which historical indicators suggest could precede an economic adjustment. Standard portfolio diversification (60% equities, 40% bonds) remains recommended.");
                break;
            case "astronomy":
                sb.append("Astrophysics Data (Astronomy Pack 1.0):\n");
                sb.append("A black hole is a region of spacetime where gravity is so strong that nothing, including light, can escape. According to General Relativity, this is caused by mass compression at a singular point.");
                break;
            case "engineering":
                sb.append("Structural Specification (Engineering Pack 1.0):\n");
                sb.append("For a suspension bridge, the maximum cable tension occurs at the towers. Using the catenary equation y = a * cosh(x/a), the structural load limits must satisfy a safety factor of 1.8.");
                break;
            case "legal":
                sb.append("Legal Precedent (Legal Pack 1.0):\n");
                sb.append("Under the Uniform Commercial Code (UCC) Section 2-201, a contract for the sale of goods for the price of $500 or more is not enforceable unless there is some writing sufficient to indicate that a contract for sale has been made.");
                break;
            default:
                sb.append("Your query \"").append(prompt).append("\" has been parsed by the grammar engine. Syntactic trees loaded. Your input matches a standard English declarative format. No grammar or spelling errors were detected.");
        }

        // 3. Suffix by Profile
        sb.append("\n\n---\n");
        switch (profileName) {
            case "Teacher":
                sb.append("Keep up the good work! Grade: A+");
                break;
            case "Scientist":
                sb.append("Status: Empirical Validation Complete. Accuracy: 99.897%");
                break;
            case "Business Consultant":
                sb.append("Action Item: Implement these takeaways immediately to drive organic synergy.");
                break;
            case "Creative Writer":
                sb.append("And so the story concludes, written upon the digital parchment of time.");
                break;
            case "Programmer":
                sb.append("// Done. 0 errors, 0 warnings. Thread terminated cleanly.");
                break;
            case "Historian":
                sb.append("As the philosopher George Santayana wrote: 'Those who cannot remember the past are condemned to repeat it.'");
                break;
            default:
                sb.append("ChatGPT Professional Suite v1.0");
        }

        return sb.toString();
    }
}
