Polymer('x-project-card', {
  publish: {
    favorite: {
      value: false,
      reflect: true
    }
  },
  hideEvent: true,
  favoriteTapped: function(event, detail, sender) {
    this.fire('favorite-tap', {project: this.project});
  },
  stages: [
    "Unqualified",
    "Qualified",
    "Working on Proposal",
    "Closing",
    "Contract negotiations"
  ],
  projectChanged: function(){
    if (!!this.project) {
      this.stageIndex = this.stages.indexOf(this.project.StageName);

      // Hide dates if not available
      if (this.project.Budgeted_Work_Start_Date__c !== null || this.project.Budgeted_Work_End_Date__c !== null ) {
        this.hideEvent = false;
      }

      // Modified date
      this.modified = moment(this.project.LastModifiedDate).fromNow();

      // DL date from now
      this.dl = moment(this.project.CloseDate).fromNow();

      // Rounded amount
      this.amount = Math.round(this.project.Amount / 1000);

    }
  }
});