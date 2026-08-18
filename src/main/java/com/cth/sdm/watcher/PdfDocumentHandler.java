package com.cth.sdm.watcher;
import org.springframework.stereotype.Component;
import java.io.File;

@Component
public class PdfDocumentHandler implements DocumentHandler {
    @Override
    public boolean supports(File file) { return file.getName().toLowerCase().endsWith(".pdf"); }
    @Override
    public String process(File file) { return "Processed PDF Document: " + file.getName(); }
    @Override
    public String getName() { return "PDF Document Handler"; }
}
