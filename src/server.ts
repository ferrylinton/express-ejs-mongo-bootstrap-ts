import { app } from '@/app';
import { port } from './config/env-constant';

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
