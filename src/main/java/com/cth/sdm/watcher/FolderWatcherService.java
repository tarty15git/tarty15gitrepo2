package com.cth.sdm.watcher;

import com.cth.sdm.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.util.Optional;

@Service
@EnableScheduling
public class FolderWatcherService {

    @Autowired
    private ConfigService configService;

    @Autowired
    private DocumentHandlerRegistry handlerRegistry;

    @PostConstruct
    public void initFolder() {
        String folderPath = configService.getConfig("WATCH_FOLDER", "./watch_drop_folder");
        File dir = new File(folderPath);
        if (!dir.exists()) dir.mkdirs();
    }

    @Scheduled(fixedDelay = 5000)
    public void scanDropFolder() {
        String folderPath = configService.getConfig("WATCH_FOLDER", "./watch_drop_folder");
        File dir = new File(folderPath);
        if (!dir.exists() || !dir.isDirectory()) return;

        File[] files = dir.listFiles();
        if (files == null || files.length == 0) return;

        for (File file : files) {
            if (file.isFile() && !file.getName().startsWith(".")) {
                processFile(file);
            }
        }
    }

    public String processFile(File file) {
        Optional<DocumentHandler> handlerOpt = handlerRegistry.findHandlerForFile(file);
        if (handlerOpt.isPresent()) {
            return handlerOpt.get().process(file);
        }
        return "UNPROCESSED: No handler registered for file type";
    }
}
