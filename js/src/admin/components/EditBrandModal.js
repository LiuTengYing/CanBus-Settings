import app from 'flarum/admin/app';
import Modal from 'flarum/common/components/Modal';
import Button from 'flarum/common/components/Button';

export default class EditBrandModal extends Modal {
  oninit(vnode) {
    super.oninit(vnode);
    this.brand = this.attrs.brand;
    this.newName = this.brand.attributes.name || '';
  }
  
  className() {
    return 'EditBrandModal Modal--small';
  }
  
  title() {
    return 'Edit Brand';
  }
  
  content() {
    return (
      <div className="Modal-body">
        <div className="Form">
          <div className="Form-group">
            <label>Brand Name</label>
            <input 
              className="FormControl" 
              type="text" 
              value={this.newName} 
              oninput={e => this.newName = e.target.value} 
            />
          </div>
          
          <div className="Form-group">
            <Button
              className="Button Button--primary"
              type="submit"
              onclick={() => {
                this.attrs.onsubmit(this.newName);
                this.hide();
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }
} 