#!/usr/bin/env bash

input=$(cat)

# --- Parse JSON with Node.js (no jq required) ---
read_json() {
  node -e "
    try {
      const d = JSON.parse(process.argv[1]);
      const get = (obj, path) => path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
      const val = get(d, process.argv[2]);
      if (val !== null && val !== undefined) process.stdout.write(String(val));
    } catch(e) {}
  " "$input" "$1" 2>/dev/null
}

model=$(read_json "model.display_name")
cwd=$(read_json "cwd")
used_pct=$(read_json "context_window.used_percentage")
remaining_pct=$(read_json "context_window.remaining_percentage")
ctx_size=$(read_json "context_window.context_window_size")
input_tokens=$(read_json "context_window.current_usage.input_tokens")

# --- ANSI colors ---
RESET="\033[0m"
DIM="\033[2m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
MAGENTA="\033[35m"
BLUE="\033[34m"

# --- Model segment ---
if [ -n "$model" ]; then
  model_seg="${CYAN}${model}${RESET}"
else
  model_seg="${DIM}Claude${RESET}"
fi

# --- Working directory (shorten home to ~) ---
whoami_val=$(whoami 2>/dev/null || echo "")
home_win="C:/Users/${whoami_val}"
home_unix="/c/Users/${whoami_val}"
short_cwd="${cwd//$home_win/~}"
short_cwd="${short_cwd//$home_unix/~}"
dir_seg="${BLUE}${short_cwd}${RESET}"

# --- Git branch ---
git_branch=$(git --no-optional-locks -C "$cwd" branch --show-current 2>/dev/null)
if [ -n "$git_branch" ]; then
  git_seg=" ${DIM}on${RESET} ${MAGENTA}${git_branch}${RESET}"
else
  git_seg=""
fi

# --- Context window segment ---
if [ -n "$used_pct" ] && [ -n "$remaining_pct" ]; then
  used_int=${used_pct%%.*}
  if [ "$used_int" -ge 80 ] 2>/dev/null; then
    ctx_color="$RED"
  elif [ "$used_int" -ge 50 ] 2>/dev/null; then
    ctx_color="$YELLOW"
  else
    ctx_color="$GREEN"
  fi
  ctx_seg="${ctx_color}ctx ${used_pct}% / ${remaining_pct}% left${RESET}"
  if [ -n "$ctx_size" ]; then
    ctx_k=$(( ctx_size / 1000 ))
    ctx_seg="${ctx_seg} ${DIM}(${ctx_k}k)${RESET}"
  fi
elif [ -n "$ctx_size" ]; then
  ctx_k=$(( ctx_size / 1000 ))
  ctx_seg="${DIM}${ctx_k}k window${RESET}"
else
  ctx_seg=""
fi

# --- Token count ---
if [ -n "$input_tokens" ]; then
  tok_seg="${DIM}${input_tokens} tokens${RESET}"
else
  tok_seg=""
fi

# --- Assemble ---
parts="${model_seg}  ${dir_seg}${git_seg}"

extras=""
if [ -n "$ctx_seg" ]; then
  extras="${ctx_seg}"
fi
if [ -n "$tok_seg" ]; then
  if [ -n "$extras" ]; then
    extras="${extras}  ${DIM}|${RESET}  ${tok_seg}"
  else
    extras="${tok_seg}"
  fi
fi

if [ -n "$extras" ]; then
  printf '%b\n' "${parts}  ${DIM}|${RESET}  ${extras}"
else
  printf '%b\n' "${parts}"
fi
