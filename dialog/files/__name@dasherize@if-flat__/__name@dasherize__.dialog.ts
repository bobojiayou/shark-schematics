
import { Component } from '@angular/core';
import { SharkModalService, SharkModalParams, SharkBaseModal, SharkToastrService } from '@shark/shark-angularX';
@Component({
  selector: '<%= selector %>',<% if (inlineTemplate) { %>
  template: `
    <p>
      <%= dasherize(name) %> works!
    </p>
  `, <% } else { %>
  templateUrl: './<%= dasherize(name) %>.component.html', <% } if (inlineStyle) { %>
  styles: [] <% } else { %>
  styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>'] <% } %> <% if (!!viewEncapsulation) { %>,
        encapsulation: ViewEncapsulation.<%= viewEncapsulation %> <% } if (changeDetection !== 'Default') { %>,
          changeDetection: ChangeDetectionStrategy.<%= changeDetection %> <% } %>
})

export class <%= classify(name) %>Dialog extends SharkBaseModal {
  title: any = '标题';
  content: any = '内容';
  constructor(
    private sharkModalService: SharkModalService,
    private sharkToastrService: SharkToastrService,
    private params: SharkModalParams
  ) {
    super();
    this.content = params.data.content;

  }

  submit() {
    this.close()
  }

}

