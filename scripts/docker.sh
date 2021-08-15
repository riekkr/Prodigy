echo "*****************************"
echo "**  Prodigy Docker Update  **"
echo "*****************************"
echo ">> Updating Prodigy..."
git pull origin master --ff-only > update.log
echo ">> Building Docker container..."
docker-compose build > update.log
echo ">> Restarting Prodigy..."
docker-compose up -d