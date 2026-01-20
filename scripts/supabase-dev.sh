#!/bin/bash

# Local Supabase helpers for dev scripts.

supabase_project_root() {
    if [ -n "${PROJECT_ROOT:-}" ]; then
        echo "$PROJECT_ROOT"
        return
    fi

    local helper_dir
    helper_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    echo "$(cd "$helper_dir/.." && pwd)"
}

supabase_project_id() {
    local root
    root="$(supabase_project_root)"
    if [ -f "$root/supabase/config.toml" ]; then
        awk -F'"' '/^project_id =/ {print $2; exit}' "$root/supabase/config.toml"
    fi
}

supabase_cmd() {
    local root
    root="$(supabase_project_root)"
    (cd "$root" && npx --yes supabase "$@")
}

supabase_is_running() {
    supabase_cmd status >/dev/null 2>&1
}

supabase_cleanup_containers() {
    local containers
    local project_id

    project_id="$(supabase_project_id)"
    if [ -n "$project_id" ]; then
        containers="$(docker ps -aq --filter "name=supabase" --filter "name=$project_id" 2>/dev/null || true)"
    else
        containers="$(docker ps -aq --filter "name=supabase" 2>/dev/null || true)"
    fi

    if [ -n "$containers" ]; then
        docker rm -f $containers 2>/dev/null || true
    fi
}

supabase_init_if_needed() {
    local root
    root="$(supabase_project_root)"
    if [ ! -f "$root/supabase/config.toml" ]; then
        supabase_cmd init
    fi
}

supabase_start() {
    if ! command -v npx >/dev/null 2>&1; then
        return 1
    fi

    SUPABASE_DEV_STARTED=false

    if supabase_is_running; then
        return 0
    fi

    supabase_cleanup_containers
    supabase_init_if_needed

    if ! supabase_cmd start; then
        return 1
    fi

    if ! supabase_is_running; then
        return 1
    fi

    SUPABASE_DEV_STARTED=true
    return 0
}

supabase_stop() {
    if ! command -v npx >/dev/null 2>&1; then
        return 0
    fi

    if [ "${SUPABASE_FORCE_STOP:-}" != "true" ] && [ "${SUPABASE_DEV_STARTED:-}" != "true" ]; then
        return 0
    fi

    supabase_cmd stop >/dev/null 2>&1 || true
    supabase_cleanup_containers
}
