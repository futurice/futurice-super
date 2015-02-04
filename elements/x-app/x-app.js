Polymer('x-app', {
  defaultSortBy: "-LastModifiedDate",
  handleItemTap: function(event, detail, sender) {
    this.selectTribe(sender.templateInstance.model.t);
    this.$.scaffold.closeDrawer();
  },
  sortBySelected: function(event, detail, sender) {
    this.sortBy = this.$.sortBy.selected;
    this.updateList();
  },
  filterChecked: function(event, detail, sender) {
    this.updateList();
  },
  selectTribe: function(tribe) {
    this.currentTribe = {
      name: tribe.name,
      prettyName: tribe.prettyName,
    }
  },
  currentTribeChanged: function(){
    this.updateList();
  },
  updateFilterOptions: function() {
    var self = this;
    self.filterOptions = self.filterConfig.map(function(option) {
      option.count = _.filter(self.projects, function(project) {
        return (
          self.currentTribe.name === project.Futu_Team__c && option.filter(project)
        );
      }).length;
      return option;
    });

    if (self.currentTribe) {
      self.currentTribe.projectCount = self.filterOptions
        .map(function(option) { return option.count; })
        .reduce(function(acc, x) { return acc + x; });
    }
  },
  projectsChanged: function(){
    this.updateList();
  },
  updateList: function(){
    var that = this;
    if (!this.sortBy) {
      this.sortBy = this.defaultSortBy;
    }
    if (this.projects && this.currentTribe) {
      this.selectedProjects = _.filter(
        this.projects,
        function (item) {
          // Check tribe
          if (that.currentTribe.name !== item.Futu_Team__c){
            return false;
          }

          // Filter out unchecked checkboxes
          for (var i = 0; i < that.filterOptions.length; i++) {
            // Start filtering out results if field is unchecked
            if (!that.filterOptions[i].isChecked &&
              that.filterOptions[i].filter(item)) {
                return false;
            }
          }

          return true;
        });
    } else {
      this.selectedProjects = [];
    }

    this.updateFilterOptions();
  },
  ready: function(){
    this.projectService = this.$.projectService;
    this.sortOptions = [
      { sortKey: "-LastModifiedDate", prettyName: "Last modified" },
      { sortKey: "Budgeted_Work_Start_Date__c", prettyName: "Start date" },
      { sortKey: "-FavoritedBy.length", prettyName: "Most popular" },
      { sortKey: "-FavoritedByUser", prettyName: "My favorites first" },
      { sortKey: "-Probability", prettyName: "Likelihood" },
      { sortKey: "Name", prettyName: "Name" }
    ];

    this.filterOptions = [];
    this.filterConfig = [
      {
        name: "Won",
        isChecked: true,
        filter: function(item){
          return item.IsWon == true;
        }
      },
      {
        name: "Lost",
        isChecked: true,
        filter: function(item) {
          return item.IsClosed && !item.IsWon;
        }
      },
      {
        name: "Open",
        isChecked: true,
        filter: function(item){
          return !item.IsClosed;
        }
      }
    ];
  },
  handleFavorite: function(event, detail, sender){
    this.$.projectService.setFavorites(detail.project);
  },
  clearTribe: function(){
    this.currentTribe = null;
    this.selected = null;
    this.updateList();
  }
});