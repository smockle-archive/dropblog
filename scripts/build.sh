#!/usr/bin/env bash
# Abort if any command (incl. in pipeline) exits with error
set -eo pipefail

# List of build directories
declare -a build_directories=(
  "dropbox-to-sns"
  "sns-to-s3"
  "create-s3-to-github"
  "delete-s3-to-github"
)

for index in ${!build_directories[*]}; do
  # Short-circuit if build directory does not exist
  # Short-circuit if build directory does not contain a TypeScript config file
  if [ ! -d "${build_directories[$index]}" ] || [ ! -f "${build_directories[$index]}/tsconfig.json" ]; then
    continue
  fi

  # Clean-up previously-compiled files
  zipfile="$(basename "${build_directories[$index]}").zip"
  set +e
  rm "${build_directories[$index]}/index.js" 2>/dev/null
  rm "${build_directories[$index]}/${zipfile}" 2>/dev/null
  set -e

  # Install dependencies
  npm --prefix "${build_directories[$index]}" install "${build_directories[$index]}"

  # Compile TypeScript using config in 'tsconfig.json'
  "${build_directories[$index]}/node_modules/.bin/tsc" -p "${build_directories[$index]}/tsconfig.json"

  # Package depedencies and compiled code for AWS Lambda
  pushd "${build_directories[$index]}" >/dev/null
  zip -q -r "${zipfile}" ./*
  popd >/dev/null
  unset zipfile
done

unset build_directories