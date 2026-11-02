# ==========================================
# 项目配置
# ==========================================
PROJECT_NAME := leon-chinese-web
IMAGE_TAG    := 1.0.0
IMAGE_NAME   := $(PROJECT_NAME):$(IMAGE_TAG)
IMAGE_FILE   := $(PROJECT_NAME).tar
BASE_IMAGE   := node:22-alpine

# ==========================================
# 系统指令兼容处理
# ==========================================
ifeq ($(OS),Windows_NT)
    RM := del /Q /F
    DOCKER := docker.exe
else
    RM := rm -rf
    DOCKER := docker
endif

# ==========================================
# 构建目标 (Targets)
# ==========================================

.PHONY: all clean build-amd64 export-image check-base-image help

# 默认流程：清理 -> 检查基础镜像 -> 跨平台构建 -> 导出镜像文件
all: clean build-amd64 export-image
	@echo ""
	@echo "===================================================="
	@echo "✅ 发布包构建完成!"
	@echo "📦 镜像文件: $(IMAGE_FILE)"
	@echo "🚀 目标架构: Linux/AMD64 (Ubuntu 22)"
	@echo "===================================================="

# 1. 清理历史构建产物
clean:
	@echo "正在清理旧的构建产物和镜像文件..."
	$(RM) .next
	$(RM) out
	$(RM) $(IMAGE_FILE)

# 2. 💡 自动化检查：检查本地是否有 AMD64 架构的基础镜像
# 如果没有，则执行一次 pull；如果有，后续构建将完全跳过远程 metadata 检查
check-base-image:
	@echo "检查本地缓存 $(BASE_IMAGE) (AMD64)..."
	@if ! $(DOCKER) image inspect $(BASE_IMAGE) --format='{{.Architecture}}' 2>/dev/null | grep -q "amd64"; then \
		echo "🚩 本地未找到 AMD64 镜像，开始拉取..."; \
		$(DOCKER) pull --platform linux/amd64 $(BASE_IMAGE); \
	else \
		echo "✅ 本地已存在该架构镜像。"; \
	fi

# 3. 核心：跨平台构建镜像 (增加 --pull=false)
build-amd64: check-base-image
	@echo "正在构建跨平台镜像 (AMD64)..."
	$(DOCKER) build --platform linux/amd64 --pull=false -t $(IMAGE_NAME) .

# 4. 导出镜像为 TAR 文件
export-image:
	@echo "正在导出镜像到文件: $(IMAGE_FILE)..."
	$(DOCKER) save -o $(IMAGE_FILE) $(IMAGE_NAME)

# 帮助信息
help:
	@echo "可用命令:"
	@echo "  make           - 执行完整发布流程"
	@echo "  make clean     - 清理本地产生的临时文件和tar包"
	@echo "  make help      - 显示此帮助信息"