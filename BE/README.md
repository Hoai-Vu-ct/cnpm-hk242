# Cần chạy các lệnh dưới đây trong terminal

```sh
cd BE
npm install
npm run dev
```

# Setup ngrok
Tải ngrok từ link sau https://download.ngrok.com/

Sau khi setup xong, chạy trong ngrok các dòng lệnh sau

```
ngrok config add-authtoken 2woj8Bb7bSC5szy8prHsD5DiHwv_7mww21eFWXRZY2UTwGrUo
ngrok http --url=live-newt-neatly.ngrok-free.app 5000
```