package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse は統一されたエラーレスポンス形式
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    string `json:"code,omitempty"`
}

// エラーレスポンス用のヘルパー関数

func BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, ErrorResponse{
		Error:   "Bad Request",
		Message: message,
		Code:    "INVALID_REQUEST",
	})
}

func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, ErrorResponse{
		Error:   "Unauthorized",
		Message: message,
		Code:    "UNAUTHORIZED",
	})
}

func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, ErrorResponse{
		Error:   "Forbidden", 
		Message: message,
		Code:    "FORBIDDEN",
	})
}

func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, ErrorResponse{
		Error:   "Not Found",
		Message: message,
		Code:    "NOT_FOUND",
	})
}

func Gone(c *gin.Context, message string) {
	c.JSON(http.StatusGone, ErrorResponse{
		Error:   "Gone",
		Message: message,
		Code:    "EXPIRED",
	})
}

func InternalServerError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, ErrorResponse{
		Error:   "Internal Server Error",
		Message: message,
		Code:    "INTERNAL_ERROR",
	})
}