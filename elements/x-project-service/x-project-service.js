Polymer('x-project-service', {
  favoritesUrl: "/api/favorites/",
  created: function () {
    this.projects = [];
  },
  setFavorites: function (project) {
    this.$.postFavorite.url = this.favoritesUrl + project._id;
    this.$.postFavorite.go();
  },
  handleResponse: function(){
    var projects = this.$.getAll.response;
    this.updateFavorites(projects);
    this.projects = projects;
  },
  isFavorited: function(project){
    if (this.user && project) {
      return project.FavoritedBy.indexOf(this.user) >= 0;
    } else {
      return false;
    }
  },
  updateFavorites: function(projects){
    if (this.user && projects){
      for (var i=0; i < projects.length; i++) {
        if (projects[i].FavoritedBy){
          projects[i].FavoritedByUser = this.isFavorited(projects[i]);
        } else {
          projects[i].FavoritedByUser = false;
        }
      }
    }
  },
  userChanged: function(){
    this.updateFavorites(this.projects);
  },
  handlePostResponse: function(){
    var response = this.$.postFavorite.response;

    var project = _.find(this.projects, function(project){return project._id === response.id});

    if (project) {
      project.FavoritedBy = response.FavoritedBy;
      project.FavoritedByUser = this.isFavorited(project);
    }
  },
});