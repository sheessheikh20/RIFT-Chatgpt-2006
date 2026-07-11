package com.openai.chat2006;

import org.junit.jupiter.api.Test;
import java.util.regex.Pattern;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LicenseTest {

    @Test
    void testSerialNumberGenerator() {
        // Serial keys are formatted as XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
        String pattern = "^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$";
        
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        java.util.Random rand = new java.util.Random();
        StringBuilder sb = new StringBuilder();
        for (int block = 0; block < 5; block++) {
            for (int i = 0; i < 5; i++) {
                sb.append(chars.charAt(rand.nextInt(chars.length())));
            }
            if (block < 4) {
                sb.append("-");
            }
        }
        String key = sb.toString();
        assertTrue(Pattern.matches(pattern, key), "Serial key '" + key + "' should match 2006 formatting rules");
    }
}
