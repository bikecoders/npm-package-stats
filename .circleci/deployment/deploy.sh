log_prefix=" --- ";

# Delete the project and stop the program
function restart_everything() {
  echo "$log_prefix Restarting everything";
  # stop the program
  execute_remote_command "cd $remote_server_path && docker-compose down";
  # Remove all files but the database directory
  execute_remote_command "cd $remote_server_path && ls . | grep -v 'database/*' | xargs rm -R";
}

function generate_files() {
  echo "$log_prefix Generating files";
  # Generate envProd file
  node ./.circleci/deployment/scripts/create-env-prod.js
}

# Copy files needed to the server
function copy_files() {
  echo "$log_prefix Copying files";

  temporaryFolder='files-to-copy'

  mkdir $temporaryFolder

  # Pile all the files
  cp ./package.json ./$temporaryFolder/package.json
  cp ./yarn.lock ./$temporaryFolder/yarn.lock
  cp -r ./dist ./$temporaryFolder/dist
  cp ./src/environments/.envProd ./$temporaryFolder/.envProd
  cp ./.circleci/deployment/docker-compose.yml ./$temporaryFolder/docker-compose.yml

  cd $temporaryFolder
  tar -cvf files-to-copy.tar .
  mv files-to-copy.tar ..
  cd ..

  # Copy files
  scp -P $remote_server_port files-to-copy.tar $remote_server_user@$remote_server_ip:$remote_server_path
  # Unzip them and delete tar
  execute_remote_command "cd $remote_server_path && tar -xf files-to-copy.tar && rm files-to-copy.tar";

  # Delete local files
  rm files-to-copy.tar;
  rm -R $temporaryFolder;
}


function update_docker_images() {
  echo "$log_prefix Updating Docker Images";
  execute_remote_command "cd $remote_server_path && docker-compose pull";
}

function install_dependencies() {
  echo "$log_prefix Installing dependencies";
  execute_remote_command "cd $remote_server_path && docker-compose run --rm server yarn install --production=true";
}

function start_project() {
  echo "$log_prefix Starting project";
  execute_remote_command "cd $remote_server_path && docker-compose up -d";
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

function execute_remote_command() {
  ssh $remote_server_ip -l $remote_server_user -p $remote_server_port $1;
}

restart_everything;
generate_files;
copy_files;
update_docker_images;
install_dependencies;
start_project;
check_api_is_alive;

exit_indicating_status;
