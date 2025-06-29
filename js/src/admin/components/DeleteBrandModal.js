import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export default class DeleteBrandModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.brand = this.attrs.brand;
  }
  
  className() {
    return 'DeleteBrandModal Modal--small';
  }
  
  title() {
    return 'Confirm Deletion';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <p>Are you sure you want to delete the brand "{this.brand.attributes.name}"? This will also delete all associated models, years, configs, and links.</p>
        
        <div className="Form-group">
          <Button
            className="Button Button--primary Button--danger"
            onclick={() => {
              this.attrs.onconfirm();
              this.hide();
            }}
          >
            Delete
          </Button>
          {' '}
          <Button
            className="Button"
            onclick={() => this.hide()}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }
} 