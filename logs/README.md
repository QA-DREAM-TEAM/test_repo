# Logs directory
# This directory contains application log files

## Log Files

- `error.log` - Error-level messages only
- `combined.log` - All log messages  
- `http.log` - HTTP request/response logs (when enabled)

## Rotation

Log files are automatically rotated when they reach the configured size limit.
Old log files are compressed and archived with timestamps.

## Security

Log files may contain sensitive information. Ensure proper file permissions
and access controls are in place.

## Retention

Configure log retention policies based on your compliance and storage requirements.