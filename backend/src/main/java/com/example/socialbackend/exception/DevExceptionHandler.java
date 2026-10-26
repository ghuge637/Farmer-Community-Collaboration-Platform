package com.example.socialbackend.exception;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.io.PrintWriter;
import java.io.StringWriter;

@ControllerAdvice
public class DevExceptionHandler {

    @Value("${app.debug:false}")
    private boolean debug;

    @org.springframework.web.bind.annotation.ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(org.springframework.dao.DataIntegrityViolationException ex) {
        // Return a friendly 409 conflict indicating DB constraint violation
        java.util.Map<String,Object> m = new java.util.HashMap<>();
        m.put("error", "Data integrity error");
        if (debug && ex.getMessage() != null) m.put("detail", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(m);
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<?> handleUnsupportedMedia(org.springframework.web.HttpMediaTypeNotSupportedException ex) {
        java.util.Map<String,Object> m = new java.util.HashMap<>();
        m.put("error", "Content-Type not supported");
        if (debug && ex.getContentType() != null) m.put("contentType", ex.getContentType().toString());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(m);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatus(ResponseStatusException ex) {
        java.util.Map<String,Object> m = new java.util.HashMap<>();
        String reason = ex.getReason() == null ? "" : ex.getReason();
        m.put("error", reason.isBlank() ? ex.getStatusCode().toString() : reason);
        m.put("status", ex.getStatusCode().value());
        return ResponseEntity.status(ex.getStatusCode()).body(m);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAll(Exception ex) {
        String err = ex == null || ex.getMessage() == null ? "" : ex.getMessage();
        if (debug) {
            StringWriter sw = new StringWriter();
            ex.printStackTrace(new PrintWriter(sw));
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("error", err);
            m.put("stack", sw.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(m);
        }
        java.util.Map<String,Object> m = new java.util.HashMap<>();
        m.put("error", "Internal server error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(m);
    }
}
