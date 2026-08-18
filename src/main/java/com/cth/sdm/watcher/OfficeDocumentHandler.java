package com.cth.sdm.watcher;
import org.springframework.stereotype.Component;
import java.io.File;

@Component
public class OfficeDocumentHandler implements DocumentHandler {
    @Override
    public boolean supports(File file) {
        String name = file.getName().toLowerCase();
        return name.endsWith(".xlsx") || name.endsWith(".xls") ||
               name.endsWith(".docx") || name.endsWith(".doc") ||
               name.endsWith(".pptx") || name.endsWith(".ppt");
    }
    @Override
    public String process(File file) {
        return "Processed MS Office Document: " + file.getName() + " (" + file.length() + " bytes)";
    }
    @Override
    public String getName() { return "Microsoft Office Document Handler"; }
}
