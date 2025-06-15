package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

var debugMode bool

func init() {
	fmt.Printf("Initializing test server...\n")
	debugMode = (os.Getenv("DEBUG") == "true")
}

func debugLog(format string, args ...interface{}) {
	if debugMode {
		fmt.Printf("[DEBUG] "+format+"\n", args...)
	}
}

func main() {
	http.HandleFunc("/json", handleJSON)
	fmt.Println("Server starting on :8080")
	fmt.Println("Available endpoints:")
	fmt.Println("  GET /json - serve all test JSON files")
	fmt.Println("  GET /json?size=100kb - serve test100kb.json")
	fmt.Println("  GET /json?size=500kb - serve test500kb.json")
	debugLog("Debug mode enabled")
	http.ListenAndServe(":8080", nil)
}

func handleJSON(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("Request: %s %s\n", r.Method, r.URL.String())
	debugLog("Handling request from %s", r.RemoteAddr)

	w.Header().Set("Content-Type", "application/json")

	size := r.URL.Query().Get("size")
	if size != "" {
		debugLog("Serving specific file for size: %s", size)
		serveSpecificFile(w, size)
		return
	}

	debugLog("Serving all files")
	serveAllFiles(w)
}

func serveSpecificFile(w http.ResponseWriter, size string) {
	filename, err := getFilenameBySize(size)
	if err != nil {
		debugLog("Invalid size parameter: %s", size)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	debugLog("Reading file: %s", filename)
	data, err := readJSONFile(filename)
	if err != nil {
		debugLog("Failed to read file %s: %v", filename, err)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}

	debugLog("Successfully served file: %s (%d bytes)", filename, len(data))
	w.Write(data)
}

func serveAllFiles(w http.ResponseWriter) {
	const jsonDir = "./json"

	debugLog("Reading directory: %s", jsonDir)
	files, err := os.ReadDir(jsonDir)
	if err != nil {
		debugLog("Failed to read directory %s: %v", jsonDir, err)
		http.Error(w, "Failed to read directory", http.StatusInternalServerError)
		return
	}

	var jsonData []json.RawMessage
	for _, file := range files {
		if !isTestJSONFile(file) {
			debugLog("Skipping non-test file: %s", file.Name())
			continue
		}

		debugLog("Processing file: %s", file.Name())
		data, err := readJSONFile(file.Name())
		if err != nil {
			debugLog("Failed to read file %s: %v", file.Name(), err)
			continue
		}

		jsonData = append(jsonData, data)
	}

	debugLog("Encoding response with %d files", len(jsonData))
	if err := json.NewEncoder(w).Encode(jsonData); err != nil {
		debugLog("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

func getFilenameBySize(size string) (string, error) {
	validSizes := map[string]string{
		"100kb": "test100KB.json",
		"500kb": "test500KB.json",
	}

	filename, exists := validSizes[size]
	if !exists {
		return "", fmt.Errorf("invalid size parameter. Valid options: 100kb, 500kb")
	}

	return filename, nil
}

func readJSONFile(filename string) (json.RawMessage, error) {
	const jsonDir = "./json/"

	filepath := jsonDir + filename
	debugLog("Reading file from path: %s", filepath)

	_, err := os.Stat(filepath)
	if err != nil {
		debugLog("File stat failed for %s: %v", filepath, err)
		return nil, err
	}

	data, err := os.ReadFile(filepath)
	if err != nil {
		debugLog("File read failed for %s: %v", filepath, err)
		return nil, err
	}

	if !json.Valid(data) {
		debugLog("Invalid JSON format in file: %s", filepath)
		return nil, fmt.Errorf("invalid JSON format")
	}

	debugLog("Successfully read and validated JSON file: %s (%d bytes)", filepath, len(data))
	return data, nil
}

func isTestJSONFile(file os.DirEntry) bool {
	if file.IsDir() {
		return false
	}

	name := file.Name()
	return strings.HasPrefix(name, "test") && strings.HasSuffix(name, ".json")
}
