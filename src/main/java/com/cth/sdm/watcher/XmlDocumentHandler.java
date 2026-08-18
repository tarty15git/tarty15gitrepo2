package com.cth.sdm.watcher;
import org.springframework.stereotype.Component;
import java.io.File;

@Component
public class XmlDocumentHandler implements DocumentHandler {
    @Override
    public boolean supports(File file) { return file.getName().toLowerCase().endsWith(".xml"); }
    @Override
    public String process(File file) { return "Processed XML Document: " + file.getName(); }
    @Override
    public String getName() { return "XML Document Handler"; }
}
