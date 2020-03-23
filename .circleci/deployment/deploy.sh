log_prefix=" --- ";

# Delete the project and stop the program
function restart_everything() {
  echo "$log_prefix Restarting everything";
  # stop the program
  ssh $remote_server_ip -l $remote_server_user -p $remote_server_port \
    "killall node";
  # Remove all files but the database directory
  ssh $remote_server_ip -l $remote_server_user -p $remote_server_port \
    "cd $remote_server_path && ls . | grep -v 'database/*' | xargs rm -R";
}

function generate_files() {
  echo "$log_prefix Generating files";
  # Generate envProd file
  node ./.circleci/deployment/scripts/create-env-prod.js
}

# Copy files needed to the server
function copy_files() {
  echo "$log_prefix Copying files";

  tar -cvf files-to-copy.tar \
    ./package.json \
    ./yarn.lock \
    ./dist \
    ./src/environments/.envProd

  # Copy files
  scp -P $remote_server_port files-to-copy.tar $remote_server_user@$remote_server_ip:$remote_server_path
  # Unzip them and delete tar
  ssh $remote_server_ip -l $remote_server_user -p $remote_server_port \
    "cd $remote_server_path && tar -xvf files-to-copy.tar && rm files-to-copy.tar";

  # Delete local tar
  rm files-to-copy.tar;
}

function install_dependencies() {
  echo "$log_prefix Installing dependencies";
  ssh $remote_server_ip -l $remote_server_user -p $remote_server_port \
    "cd $remote_server_path && yarn install --production=true";
}

function start_project() {
  echo "$log_prefix Starting project";
  ssh $remote_server_ip -l $remote_server_user -p $remote_server_port \
    "cd $remote_server_path && npx cross-env $(cat ./src/environments/.envProd | xargs) node ./dist/main.js" > /dev/null &
}

# Check if the API is up doing a ping maximum 10 times
function check_api_is_alive() {
  echo "$log_prefix Checking health of API";
  api_alive=false;

  for i in `seq 1 20`;
  do
    echo "Try number $i";
    # Make the "ping" in silence
    ssh $remote_server_ip -l $remote_server_user -p $remote_server_port \
      "curl localhost:3000/health &> /dev/null;"

    if [ $? -eq 0 ]; then
      api_alive=true;
      break
    else
      sleep 1;
    fi

  done
}

function exit_indicating_status() {
  if [ "$api_alive" = true ] ; then
    echo "$log_prefix Api deployed successfully"
    exit 0;
  else
    echo "$log_prefix The Api is not up :("
    exit 1;
  fi
}

restart_everything;
generate_files;
copy_files;
install_dependencies;
start_project;
check_api_is_alive;

exit_indicating_status;
