package com.cth.sdm.watcher;
import java.io.File;
public interface DocumentHandler {
    boolean supports(File file);
    String process(File file);
    String getName();
}
