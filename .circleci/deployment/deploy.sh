log_prefix=" --- ";

# Delete the project and destroy containers
function restart_everything() {
  echo "$log_prefix Restarting everything";
  ssh $remote_server_user@$remote_server_ip "cd $remote_server_path && docker-compose down";
  ssh $remote_server_user@$remote_server_ip "rm -R $remote_server_path";
  ssh $remote_server_user@$remote_server_ip "mkdir -p $remote_server_path";
}

# Copy files needed to the server
function copy_files() {
  echo "$log_prefix Copying files";
  # package.json
  scp ./package.json $remote_server_user@$remote_server_ip:$remote_server_path
  # Built project
  scp -r ./dist $remote_server_user@$remote_server_ip:$remote_server_path
  # docker-compose
  scp ./.circleci/deployment/docker-compose.yml $remote_server_user@$remote_server_ip:$remote_server_path
}

function install_dependencies() {
  echo "$log_prefix Installing dependencies";
  ssh $remote_server_user@$remote_server_ip "docker run --rm -v $remote_server_path:/repo node:10.15-alpine /bin/ash -c 'cd /repo && yarn'";
}

function start_project() {
  echo "$log_prefix Starting project";
  ssh $remote_server_user@$remote_server_ip "cd $remote_server_path && docker-compose up -d";
}

# Check if the API is up doing a ping maximum 10 times
function check_api_is_alive() {
  echo "$log_prefix Checking health of API";
  api_alive=false;

  for i in `seq 1 10`;
  do
    echo "Try number $i";
    # Make the "ping" in silence
    curl $remote_server_ip:3000/health &> /dev/null;

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
copy_files;
install_dependencies;
start_project;
check_api_is_alive;

exit_indicating_status;
