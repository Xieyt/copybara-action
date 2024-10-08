#!/usr/bin/env bash

# Handle environment variables for backwards compatibility
if [ -n "${COPYBARA_SUBCOMMAND}" ] || [ -n "${COPYBARA_CONFIG}" ] || [ -n "${COPYBARA_WORKFLOW}" ] || [ -n "${COPYBARA_SOURCEREF}" ] || [ -n "${COPYBARA_OPTIONS}" ]; then
  echo "Detected \$COPYBARA_* environment variables, overwriting shell args"
  ARGS=()
  if [ -n "${COPYBARA_SUBCOMMAND}" ]; then
    ARGS+=("${COPYBARA_SUBCOMMAND}")
  else
    ARGS+=("migrate" "--verbose" )
  fi
  if [ -n "${COPYBARA_CONFIG}" ]; then
    ARGS+=("${COPYBARA_CONFIG}")
  else
    ARGS+=("copy.bara.sky")
  fi
  if [ -n "${COPYBARA_WORKFLOW}" ]; then
    ARGS+=("${COPYBARA_WORKFLOW}")
  else
    ARGS+=("default")
  fi
  if [ -n "${COPYBARA_SOURCEREF}" ]; then
    ARGS+=("${COPYBARA_SOURCEREF}")
  fi
  if [ -n "${COPYBARA_OPTIONS}" ]; then
    ARGS+=(${COPYBARA_OPTIONS})  # no quotation marks to split them by space
  fi
  echo "Setting arguments to: \"${ARGS[@]}\""
  set -- "${ARGS[@]}"
fi

exec java -jar /opt/copybara/copybara_deploy.jar "$@"
