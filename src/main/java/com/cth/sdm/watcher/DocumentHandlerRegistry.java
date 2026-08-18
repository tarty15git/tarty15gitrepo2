package com.cth.sdm.watcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DocumentHandlerRegistry {

    @Autowired(required = false)
    private List<DocumentHandler> handlers = new ArrayList<>();

    public void registerHandler(DocumentHandler handler) {
        handlers.add(handler);
    }

    public List<DocumentHandler> getHandlers() { return handlers; }

    public Optional<DocumentHandler> findHandlerForFile(File file) {
        return handlers.stream().filter(h -> h.supports(file)).findFirst();
    }
}
