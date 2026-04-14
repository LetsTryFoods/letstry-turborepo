import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

async function testUpload() {
  const dirPath = path.join(process.cwd(), 'test-images');
  console.log(`Checking directory: ${dirPath}`);

  let files: string[] = [];
  try {
    files = fs.readdirSync(dirPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
    });
  } catch (error: any) {
    console.error(`Failed to read directory: ${error.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('No images found in the directory.');
    process.exit(1);
  }

  const imageToUpload = files[0];
  const imagePath = path.join(dirPath, imageToUpload);
  console.log(`Selected image to upload: ${imagePath}`);

  const form = new FormData();
  form.append('files', fs.createReadStream(imagePath), {
    filename: imageToUpload,
  });

  const apiUrl = 'http://localhost:5000/files/upload'; // Make sure this matches your backend PORT
  console.log(`Uploading to ${apiUrl}...`);

  try {
    const response = await axios.post(apiUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('Upload successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error('Upload failed!');
    if (error.response) {
      console.error(
        `Status: ${error.response.status}`,
        JSON.stringify(error.response.data, null, 2),
      );
    } else {
      console.error(error.message);
    }
  }
}

testUpload();
